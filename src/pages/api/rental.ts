import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handleRental(req: NextApiRequest, res: NextApiResponse) {
   if (req.method === 'POST') {
      try {
         const { customerId, filmId } = req.body;

         // Vérifier si le film existe et est disponible
         const film = await prisma.film.findUnique({
            where: { id: filmId },
         });

         if (!film) {
            return res.status(404).json({ error: 'Film non trouvé.' });
         }

         if (!film.available) {
            return res.status(400).json({ error: 'Film non disponible.' });
         }

         // Vérifier si le client existe
         const customer = await prisma.customer.findUnique({
            where: { id: customerId },
         });

         if (!customer) {
            return res.status(404).json({ error: 'Client non trouvé.' });
         }

         // Enregistrer la location
         const rental = await prisma.rental.create({
            data: {
               customerId: customer.id,
               filmId: film.id,
            },
         });

         // Mettre à jour la disponibilité du film
         await prisma.film.update({
            where: { id: film.id },
            data: { available: false },  // Le film devient non disponible
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
