export async function sendMail(to: string, subject: string, message: string): Promise<void> {
  console.log(`
     ======= Simulated Email =======
     To: ${to}
     Subject: ${subject}
     Message:
     ${message}
     ===============================
   `);
}
