const appAcceptTemplate = ({
  username,
  subject,
}: {
  username: string;
  subject: string;
}) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Application Accepted</title>
  </head>

  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f3f7f5;
      font-family: Arial, Helvetica, sans-serif;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="background-color: #f3f7f5; padding: 40px 15px"
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
              box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
            "
          >
            <!-- Header -->
            <tr>
              <td
                align="center"
                style="background-color: #16a34a; padding: 45px 25px"
              >
                <div
                  style="
                    width: 70px;
                    height: 70px;
                    line-height: 70px;
                    margin: 0 auto 18px;
                    border-radius: 50%;
                    background-color: #ffffff;
                    color: #16a34a;
                    font-size: 36px;
                    font-weight: bold;
                  "
                >
                  ✓
                </div>

                <h1
                  style="
                    margin: 0;
                    color: #ffffff;
                    font-size: 28px;
                    line-height: 36px;
                  "
                >
                  Congratulations!
                </h1>

                <p style="margin: 10px 0 0; color: #dcfce7; font-size: 15px">
                  Your application has been accepted
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
                  We are delighted to inform you that your application has been
                  accepted by our hiring team.
                </p>

                <!-- Job -->
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="
                    background-color: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    border-radius: 12px;
                    margin-bottom: 25px;
                  "
                >
                  <tr>
                    <td style="padding: 20px">
                      <p
                        style="
                          margin: 0 0 7px;
                          color: #15803d;
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
                          color: #166534;
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

                <!-- Message -->
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="
                    background-color: #f8fafc;
                    border-radius: 10px;
                    margin-bottom: 25px;
                  "
                >
                  <tr>
                    <td style="padding: 20px">
                      <p
                        style="
                          margin: 0;
                          color: #4b5563;
                          font-size: 14px;
                          line-height: 24px;
                        "
                      >
                        We were impressed by your application and believe your
                        skills and experience would be a great addition to the
                        team. Our hiring team will contact you soon regarding
                        the next steps.
                      </p>
                    </td>
                  </tr>
                </table>

                <p
                  style="
                    margin: 0;
                    color: #6b7280;
                    font-size: 14px;
                    line-height: 24px;
                  "
                >
                  We look forward to having you with us and wish you a
                  successful journey ahead!
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

export default appAcceptTemplate;
