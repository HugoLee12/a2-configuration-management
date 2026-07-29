// Log có cấu trúc dùng chung: mỗi bản ghi là đúng một dòng JSON.
// Cùng lý do đường dẫn tương đối như service.ts, xem chú thích đầu file đó.
import type { ErrorRequestHandler, Express, RequestHandler } from "express";

// Ba service dùng chung một image nên tên service không suy ra được từ mã;
// compose.yaml đặt biến này cho từng container. Tên nằm trong từng bản ghi chứ
// không chỉ ở prefix của `docker compose logs`, vì prefix đó biến mất ngay khi
// log được gom về một chỗ.
const SERVICE = process.env.SERVICE_NAME ?? "unknown";

/** Một bản ghi. JSON.stringify escape cả xuống dòng, nên stack lỗi vẫn nằm gọn một dòng. */
function line(level: "info" | "error", fields: Record<string, unknown>): string {
  return JSON.stringify({ time: new Date().toISOString(), level, service: SERVICE, ...fields });
}

/** Ghi một lỗi. Giữ nguyên stack khi có, vì đó là thứ cần tới lúc đọc lại. */
export function logError(msg: string, error: unknown): void {
  const detail = error instanceof Error ? (error.stack ?? error.message) : String(error);
  console.error(line("error", { msg, error: detail }));
}

const record: RequestHandler = (req, res, next) => {
  const start = performance.now();

  // Đọc trước next(): req.path là getter trên req.url, mà router được phép sửa req.url.
  const path = req.path;

  // finish chứ không phải close, cùng lý do như phần đo ở metrics.ts: chỉ ghi
  // request đã phục vụ xong.
  res.on("finish", () => {
    console.log(
      line("info", {
        msg: "request",
        method: req.method,
        // Đường dẫn thô, không phải mẫu route: log là bản ghi từng sự kiện nên
        // không có chuyện phình cardinality như ở metrics. Với service redirect
        // đường dẫn thô chính là mã ngắn, tức đúng mức chi tiết mà #9 cho phép;
        // địa chỉ đích mà mã ngắn trỏ tới thì không bản ghi nào chạm vào.
        path,
        status: res.statusCode,
        duration_ms: Number((performance.now() - start).toFixed(1)),
      }),
    );
  });

  next();
};

// Tự trả response thay vì next(err). Error handler mặc định của express in
// `err.stack` thô ra stderr, tức là để lại đúng một loại bản ghi không có cấu
// trúc trong khi #9 đòi toàn bộ log đọc được bằng máy. Đổi lại, thân của các
// response lỗi chưa bắt được chuyển từ HTML sang JSON, và như vậy còn khớp với
// phần còn lại của API.
const report: ErrorRequestHandler = (err, _req, res, _next) => {
  logError("request lỗi", err);
  res.status(typeof err?.status === "number" ? err.status : 500).json({
    error: "Request không xử lý được",
  });
};

/**
 * Gắn phần ghi log request lên một app express.
 *
 * Phải gọi **trước** `mountMetrics`, không chỉ trước các route: `mountMetrics`
 * đăng ký cả route `/metrics`, nên gọi sau thì chính request scrape không được ghi.
 */
export function mountLogging(app: Express): void {
  app.use(record);
}

/**
 * Gắn phần ghi log lỗi lên một app express.
 *
 * Phải gọi **sau** mọi route: express chỉ tìm error handler nằm sau chỗ phát sinh
 * lỗi, nên error handler đăng ký sớm sẽ không bao giờ chạy.
 */
export function mountErrorLogging(app: Express): void {
  app.use(report);
}
