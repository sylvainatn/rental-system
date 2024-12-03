import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handleCustomer(req: NextApiRequest, res: NextApiResponse) {
   if (req.method === 'GET') {
      // Récupérer tous les clients
      try {
         const customers = await prisma.customer.findMany();
         res.status(200).json(customers);
      } catch (error) {
         console.error(error);
         res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération des clients.' });
      }
   } else if (req.method === 'POST') {
      // Ajouter un nouveau client
      try {
         const { name, email } = req.body;  // Vous pouvez ajouter d'autres champs si nécessaire
         const newCustomer = await prisma.customer.create({
            data: {
               name,
               email,
            },
         });
         res.status(201).json(newCustomer); // Réponse avec le client créé
      } catch (error) {
         console.error(error);
         res.status(500).json({ error: 'Une erreur s\'est produite lors de la création d\'un client.' });
      }
   } else if (req.method === 'PUT') {
      // Modifier un client existant
      try {
         const { id, name, email } = req.body;

         if (!id) {
            return res.status(400).json({ error: 'L\'id du client est requis.' });
         }

         // Vérifier si un autre client a le même email
         const existingCustomerWithEmail = await prisma.customer.findUnique({
            where: { email },
         });

         // Si un client avec le même email existe, on empêche la mise à jour
         if (existingCustomerWithEmail && existingCustomerWithEmail.id !== id) {
            return res.status(400).json({ error: 'Un autre client possède déjà cet email.' });
         }

         // Si aucun client avec cet email, on peut procéder à la mise à jour
         const updatedCustomer = await prisma.customer.update({
            where: { id },
            data: {
               name,
               email,
            },
         });

         res.status(200).json(updatedCustomer); // Retourner le client mis à jour
      } catch (error) {
         console.error(error);
         res.status(500).json({ error: 'Une erreur s\'est produite lors de la mise à jour du client.' });
      }
   } else {
      // Méthode HTTP non supportée
      res.status(405).json({ error: 'Méthode HTTP non autorisée.' });
   }
}
