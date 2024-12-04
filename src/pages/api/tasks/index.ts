// pages/api/tasks/index.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handleTasks(req: NextApiRequest, res: NextApiResponse) {
   if (req.method === 'GET') {
      res.status(200).json({
         tasks: [
            {
               name: 'sendRemindersFiveDays',
               description: 'Envoyer des rappels à J-5.'
            },
            {
               name: 'sendRemindersThreeDays',
               description: 'Envoyer des rappels à J-3.'
            },
         ],
      });
   } else {
      res.status(405).json({ error: 'Méthode HTTP non autorisée.' });
   }
}
