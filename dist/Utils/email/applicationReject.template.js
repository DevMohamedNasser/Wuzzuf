"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appRejectTemplate = ({ username, subject, }) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Application Update</title>
  </head>

  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f7f7f8;
      font-family: Arial, Helvetica, sans-serif;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="background-color: #f7f7f8; padding: 40px 15px"
    >
      <tr>
        <td align="center">
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
              max-width: 600px;
              background-color: #ffffff;
              border-radius: 18px;
              overflow: hidden;
              box-shadow: 0 8px 30px rgba(0, 0, 0, 0.07);
            "
          >
            <!-- Header -->
            <tr>
              <td
                align="center"
                style="background-color: #374151; padding: 45px 25px"
              >
                <div
                  style="
                    width: 70px;
                    height: 70px;
                    line-height: 70px;
                    margin: 0 auto 18px;
                    border-radius: 50%;
                    background-color: #ffffff;
                    color: #6b7280;
                    font-size: 30px;
                    font-weight: bold;
                  "
                >
                  •
                </div>

                <h1
                  style="
                    margin: 0;
                    color: #ffffff;
                    font-size: 27px;
                    line-height: 36px;
                  "
                >
                  Application Update
                </h1>

                <p style="margin: 10px 0 0; color: #d1d5db; font-size: 15px">
                  Regarding your recent application
                </p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 40px 35px">
                <p
                  style="
                    margin: 0 0 18px;
                    color: #111827;
                    font-size: 18px;
                    line-height: 28px;
                  "
                >
                  Hello <strong>${username}</strong>,
                </p>

                <p
                  style="
                    margin: 0 0 25px;
                    color: #6b7280;
                    font-size: 15px;
                    line-height: 25px;
                  "
                >
                  Thank you for your interest in the position and for taking the
                  time to submit your application.
                </p>

                <!-- Job -->
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="
                    background-color: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    margin-bottom: 25px;
                  "
                >
                  <tr>
                    <td style="padding: 20px">
                      <p
                        style="
                          margin: 0 0 7px;
                          color: #9ca3af;
                          font-size: 12px;
                          font-weight: bold;
                          text-transform: uppercase;
                          letter-spacing: 1px;
                        "
                      >
                        Position
                      </p>

                      <p
                        style="
                          margin: 0;
                          color: #374151;
                          font-size: 19px;
                          font-weight: bold;
                          line-height: 27px;
                        "
                      >
                        ${subject}
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Status -->
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="
                    background-color: #fff7ed;
                    border-left: 4px solid #f97316;
                    border-radius: 8px;
                    margin-bottom: 25px;
                  "
                >
                  <tr>
                    <td style="padding: 20px">
                      <p
                        style="
                          margin: 0 0 8px;
                          color: #c2410c;
                          font-size: 16px;
                          font-weight: bold;
                        "
                      >
                        Application Not Selected
                      </p>

                      <p
                        style="
                          margin: 0;
                          color: #57534e;
                          font-size: 14px;
                          line-height: 24px;
                        "
                      >
                        After careful consideration, the hiring team has decided
                        not to move forward with your application at this time.
                      </p>
                    </td>
                  </tr>
                </table>

                <p
                  style="
                    margin: 0 0 20px;
                    color: #6b7280;
                    font-size: 14px;
                    line-height: 24px;
                  "
                >
                  This decision does not diminish your skills or experience. We
                  truly appreciate your effort and encourage you to keep
                  pursuing opportunities that match your career goals.
                </p>

                <p
                  style="
                    margin: 0;
                    color: #6b7280;
                    font-size: 14px;
                    line-height: 24px;
                  "
                >
                  We wish you the very best in your future career and hope to
                  see you apply again for other opportunities.
                </p>

                <p
                  style="
                    margin: 30px 0 0;
                    color: #374151;
                    font-size: 14px;
                    line-height: 23px;
                  "
                >
                  Best regards,<br />
                  <strong>Hiring Team</strong>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                align="center"
                style="
                  padding: 22px 25px;
                  background-color: #f8fafc;
                  border-top: 1px solid #e5e7eb;
                "
              >
                <p style="margin: 0; color: #9ca3af; font-size: 12px">
                  This is an automated email. Please do not reply to this
                  message.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
exports.default = appRejectTemplate;
