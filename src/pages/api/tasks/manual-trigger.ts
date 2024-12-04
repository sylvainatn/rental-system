// pages/api/tasks/manual-trigger.ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handleManualTrigger(req: NextApiRequest, res: NextApiResponse) {
   if (req.method === 'POST') {
      const { taskName } = req.body;

      // Vérifier si le nom de la tâche est fourni
      if (!taskName) {
         return res.status(400).json({ error: 'Le champ taskName est requis.' });
      }

      try {
         let response;

         // Vérification du nom de la tâche et appel de l'API correspondante
         if (taskName === 'sendRemindersFiveDays') {
            // Utiliser l'URL relative
            response = await axios.post('http://localhost:3000/api/tasks/reminders', { daysBeforeReturn: 5 });

         } else if (taskName === 'sendRemindersThreeDays') {
            // Utiliser l'URL relative
            response = await axios.post('http://localhost:3000/api/tasks/reminders', { daysBeforeReturn: 3 });
         } else {
            // Nom de la tâche inconnu
            return res.status(400).json({ error: 'Tâche inconnue.' });
         }

         // Si tout va bien, répondre avec un message de succès
         res.status(200).json({ message: `Tâche '${taskName}' exécutée.` });
      } catch (error: any) {
         // Log des erreurs pour débogage
         console.error('Erreur lors de l\'exécution de la tâche:', error);

         // Vérification si l'erreur provient de l'API appelée
         if (error.response) {
            return res.status(error.response.status).json({ error: error.response.data.error });
         }

         res.status(500).json({ error: 'Une erreur s\'est produite lors de l\'exécution de la tâche.' });
      }
   } else {
      // Méthode HTTP non autorisée
      res.status(405).json({ error: 'Méthode HTTP non autorisée.' });
   }
}
