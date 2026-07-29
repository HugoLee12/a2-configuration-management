// Phần đo lường dùng chung: registry, middleware đếm request, endpoint /metrics.
// Cùng lý do đường dẫn tương đối như service.ts, xem chú thích đầu file đó.
import type { Express, RequestHandler } from "express";
import { collectDefaultMetrics, Counter, Histogram, Registry } from "prom-client";

// Registry riêng thay vì registry toàn cục mặc định của prom-client, để counter
// nghiệp vụ của từng service đăng ký vào đây một cách tường minh.
export const registry = new Registry();

// Heap, độ trễ vòng lặp sự kiện, GC. Không đắt vì chỉ thu lúc bị scrape.
collectDefaultMetrics({ register: registry });

const LABELS = ["method", "endpoint", "status"] as const;

const requests = new Counter({
  name: "http_requests_total",
  help: "Số request HTTP đã phục vụ xong, phân theo phương thức, endpoint và mã trạng thái",
  labelNames: LABELS,
  registers: [registry],
});

// Bucket mặc định của prom-client trải từ 5ms tới 10s, vừa với hệ này.
const duration = new Histogram({
  name: "http_request_duration_seconds",
  help: "Phân bố độ trễ phục vụ request HTTP, tính bằng giây",
  labelNames: LABELS,
  registers: [registry],
});

const measure: RequestHandler = (req, res, next) => {
  const stopTimer = duration.startTimer();

  // finish chứ không phải close: chỉ đếm request đã phục vụ xong, không đếm
  // request bị client cắt giữa chừng.
  res.on("finish", () => {
    // Nhãn endpoint phải là mẫu route chứ không phải đường dẫn thô. Service
    // redirect nhận `/:code`, nên lấy req.path thì mỗi mã ngắn sinh một chuỗi
    // thời gian riêng và Prometheus phình không giới hạn; lấy req.route.path thì
    // mọi lượt chuyển hướng gom về đúng một nhãn. Request không khớp route nào
    // gom về "unknown", nên đường dẫn rác cũng không sinh nhãn mới.
    //
    // Đọc ở đây chứ không ở trên: lúc middleware chạy thì router chưa chọn xong
    // handler nên req.route còn trống.
    const labels = {
      method: req.method,
      endpoint: req.route ? String(req.route.path) : "unknown",
      status: String(res.statusCode),
    };
    stopTimer(labels);
    requests.inc(labels);
  });

  next();
};

/**
 * Gắn phần đo lường lên một app express.
 *
 * Phải gọi **trước** mọi route, kể cả trước `mountProbes`: express chạy middleware
 * theo đúng thứ tự đăng ký, nên route nào đăng ký trước cái này thì không được đếm.
 */
export function mountMetrics(app: Express): void {
  app.use(measure);

  app.get("/metrics", async (_req, res) => {
    res.set("content-type", registry.contentType);
    res.send(await registry.metrics());
  });
}
