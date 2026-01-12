export default function Home() {
  return (
    <main
      style={{
        padding: 24,
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
      }}
    >
      <h1>amigo.sh</h1>
      <p>Transport de intentie. CLI + Room.</p>

      <pre
        style={{
          marginTop: 16,
          padding: 12,
          background: "#111",
          color: "#eee",
          borderRadius: 8
        }}
      >
{`curl -sS -X POST http://localhost:3000/api/dispatch \\
  -H 'Content-Type: application/json' \\
  -H 'Accept: text/plain' \\
  -d '{"url":"https://example.com","note":"Cand ai 5 minute de liniste.","ttl":"7d"}'`}
      </pre>

      <p style={{ marginTop: 16, opacity: 0.7 }}>
        (local) API: <code>http://localhost:3000</code> Web:{" "}
        <code>http://localhost:3001</code>
      </p>
    </main>
  );
}
