/**
 * Chrome también puede guardar la página como "un solo archivo" (.mhtml): un
 * mensaje MIME que trae el HTML codificado (quoted-printable o base64). Si
 * viene así, se extrae y decodifica la parte text/html; si no, se devuelve
 * el texto tal cual (es un .html común).
 */
export function decodeMhtmlIfNeeded(raw: string): string {
  const head = raw.slice(0, 3000);
  if (!/MIME-Version:/i.test(head) || !/multipart\/related/i.test(head)) return raw;

  const boundary = head.match(/boundary="?([^";\r\n]+)"?/i)?.[1];
  if (!boundary) return raw;

  for (const part of raw.split("--" + boundary)) {
    const separator = part.search(/\r?\n\r?\n/);
    if (separator < 0) continue;

    const headers = part.slice(0, separator);
    if (!/Content-Type:\s*text\/html/i.test(headers)) continue;

    const body = part.slice(separator).replace(/^\s+/, "");
    const encoding = headers.match(/Content-Transfer-Encoding:\s*([\w-]+)/i)?.[1]?.toLowerCase();

    if (encoding === "base64") {
      return Buffer.from(body.replace(/\s+/g, ""), "base64").toString("utf8");
    }

    if (encoding === "quoted-printable") {
      const joined = body.replace(/=\r?\n/g, "");
      const bytes: number[] = [];
      for (let i = 0; i < joined.length; i++) {
        const hex = joined.slice(i + 1, i + 3);
        if (joined[i] === "=" && /^[0-9A-Fa-f]{2}$/.test(hex)) {
          bytes.push(parseInt(hex, 16));
          i += 2;
        } else {
          bytes.push(...Buffer.from(joined[i], "utf8"));
        }
      }
      return Buffer.from(bytes).toString("utf8");
    }

    return body;
  }

  return raw;
}
