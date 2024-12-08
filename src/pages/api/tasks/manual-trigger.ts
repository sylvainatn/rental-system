// pages/api/tasks/manual-trigger.ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handleManualTrigger(req: NextApiRequest, res: NextApiResponse) {
   if (req.method === 'POST') {
      const { taskName } = req.body;

      if (!taskName) {
         return res.status(400).json({ error: 'Le champ taskName est requis.' });
      }

      try {
         let response;

         if (taskName === 'sendRemindersFiveDays') {
            response = await axios.post('http://localhost:3000/api/tasks/reminders', { daysBeforeReturn: 5 });
         } else if (taskName === 'sendRemindersThreeDays') {
            response = await axios.post('http://localhost:3000/api/tasks/reminders', { daysBeforeReturn: 3 });
         } else {
            return res.status(400).json({ error: 'Tâche inconnue.' });
         }

         res.status(200).json({ message: `Tâche '${taskName}' exécutée.` });
      } catch (error: any) {
         console.error('Erreur lors de l\'exécution de la tâche:', error);

         if (error.response) {
            return res.status(error.response.status).json({ error: error.response.data.error });
         }

         res.status(500).json({ error: 'Une erreur s\'est produite lors de l\'exécution de la tâche.' });
      }
   } else {
      res.status(405).json({ error: 'Méthode HTTP non autorisée.' });
   }
}
