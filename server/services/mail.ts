import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY!);

export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function mailShareLinkTemplate(link: string) {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width" />
        <title>Email</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f9fafb; font-family:Inter, Arial, sans-serif; color:#111827;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f9fafb; padding:32px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; background:#ffffff; border-radius:12px; padding:32px; box-shadow:0 2px 6px rgba(0,0,0,0.05);">
                <tr>
                  <td style="text-align:left;">
                    <h1 style="margin:0 0 16px; font-size:20px; font-weight:600; color:#111827;">
                      Olá,
                    </h1>
                    <p style="margin:0 0 24px; font-size:15px; line-height:1.6; color:#374151;">
                      Precisamos de você para responder a uma nova pesquisa. Clique no link abaixo para responder:
                    </p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:24px;">
                      <tr>
                        <td align="center" bgcolor="#171717" style="border-radius:8px;">
                          <a href="${link}" target="_blank"
                            style="display:inline-block; padding:12px 24px; font-size:15px; font-weight:500; color:#ffffff; text-decoration:none; border-radius:8px; background-color:#171717;">
                            Abrir link
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:0; font-size:13px; color:#6b7280;">
                      Ou copie e cole esta URL no seu navegador:<br/>
                      <a href="${link}" target="_blank" style="color:#171717; text-decoration:underline; font-weight:500;">${link}</a>
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin-top:16px; font-size:12px; color:#9ca3af;">
                © ${new Date().getFullYear()} CincoBásicos. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
    `;
}
