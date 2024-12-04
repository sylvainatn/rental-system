import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handleRental(req: NextApiRequest, res: NextApiResponse) {
   if (req.method === 'POST') {
      try {
         const { customerId, filmId } = req.body;

         // Vérifier si le film existe
         const film = await prisma.film.findUnique({
            where: { film_id: filmId },
         });

         if (!film) {
            return res.status(404).json({ error: 'Film non trouvé.' });
         }

         // Vérifier si le film est disponible dans l'inventaire
         const inventory = await prisma.inventory.findFirst({
            where: {
               film_id: film.film_id,
               // L'inventaire doit être dans un magasin et être disponible (pas déjà loué)
               rental: {
                  some: {
                     return_date: null,  // Le film n'a pas été retourné
                  },
               },
            },
         });

         if (!inventory) {
            return res.status(404).json({ error: 'Film non disponible en stock.' });
         }

         // Vérifier si le client existe
         const customer = await prisma.customer.findUnique({
            where: { customer_id: customerId },
         });

         if (!customer || !customer.active) {
            return res.status(404).json({ error: 'Client non trouvé ou inactif.' });
         }

         // Créer la location
         const rental = await prisma.rental.create({
            data: {
               customer_id: customer.customer_id,
               inventory_id: inventory.inventory_id,
               rental_date: new Date(),
               staff_id: 1, // Remplacer par l'ID du staff si nécessaire
            },
         });

         // Marquer l'inventaire comme loué
         await prisma.inventory.update({
            where: { inventory_id: inventory.inventory_id },
            data: { last_update: new Date() }, // Mettre à jour la date de dernière mise à jour
         });

         res.status(201).json(rental); // Répondre avec la location créée
      } catch (error) {
         console.error(error);
         res.status(500).json({ error: 'Une erreur s\'est produite lors de la location.' });
      }
   } else {
      res.status(405).json({ error: 'Méthode HTTP non autorisée.' });
   }
}
