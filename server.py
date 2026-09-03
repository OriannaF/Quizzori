import http.server
import json
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "image_questions.json")

class StudoriHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path.startswith("/api/save-repo-question") or self.path.startswith("/api/sync-repo"):
            content_length = int(self.headers.get("Content-Length", 0))
            raw_body = self.rfile.read(content_length).decode("utf-8")
            try:
                payload = json.loads(raw_body)
                os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)

                existing = []
                if os.path.exists(DATA_FILE):
                    try:
                        with open(DATA_FILE, "r", encoding="utf-8") as f:
                            existing = json.load(f)
                            if not isinstance(existing, list):
                                existing = []
                    except Exception:
                        existing = []

                if isinstance(payload, list):
                    for qz in payload:
                        target = next((x for x in existing if x.get("name") == qz.get("name") or (x.get("hash") and x.get("hash") == qz.get("hash"))), None)
                        if not target:
                            existing.append(qz)
                        else:
                            for q in qz.get("questions", []):
                                if not any(eq.get("text") == q.get("text") and eq.get("type") == q.get("type") for eq in target.get("questions", [])):
                                    q_copy = dict(q)
                                    q_copy["id"] = len(target.get("questions", []))
                                    target.setdefault("questions", []).append(q_copy)
                elif isinstance(payload, dict):
                    q_hash = payload.get("hash")
                    q_name = payload.get("name") or "Cuestionario con Imágenes"
                    question = payload.get("question")

                    target = next((x for x in existing if (q_hash and x.get("hash") == q_hash) or x.get("name") == q_name), None)
                    if not target:
                        target = {"hash": q_hash or ("repo_" + str(len(existing))), "name": q_name, "questions": []}
                        existing.append(target)

                    if question:
                        exists = any(eq.get("text") == question.get("text") and eq.get("type") == question.get("type") for eq in target.get("questions", []))
                        if not exists:
                            q_copy = dict(question)
                            q_copy["id"] = len(target.get("questions", []))
                            target.setdefault("questions", []).append(q_copy)

                with open(DATA_FILE, "w", encoding="utf-8") as f:
                    json.dump(existing, f, ensure_ascii=False, indent=2)

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                response = {"ok": True, "total_quizzes": len(existing)}
                self.wfile.write(json.dumps(response).encode("utf-8"))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"ok": False, "error": str(e)}).encode("utf-8"))
                return
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == "__main__":
    server_address = ("", PORT)
    with http.server.ThreadingHTTPServer(server_address, StudoriHandler) as httpd:
        print(f"Studori Server running on http://localhost:{PORT}")
        httpd.serve_forever()
