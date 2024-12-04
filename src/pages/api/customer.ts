import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const errorMessages = {
   genericError: 'Une erreur s\'est produite lors de l\'opération.',
   clientExists: 'Un client avec cet email existe déjà.',
   missingFields: 'Tous les champs (first_name, last_name, email, store_id, address_id) sont requis.',
   clientNotFound: 'Client non trouvé.',
   emailInUse: 'Un autre client possède déjà cet email.',
};

export default async function handleCustomer(req: NextApiRequest, res: NextApiResponse) {
   if (req.method === 'GET') {
      try {
         const customers = await prisma.customer.findMany();
         res.status(200).json(customers);
      } catch (error) {
         console.error(error);
         res.status(500).json({ error: errorMessages.genericError });
      }
   } else if (req.method === 'POST') {
      try {
         const { first_name, last_name, email, store_id, address_id } = req.body;

         if (!first_name || !last_name || !email || !store_id || !address_id) {
            return res.status(400).json({ error: errorMessages.missingFields });
         }

         const existingCustomer = await prisma.customer.findUnique({
            where: { email },
         });

         if (existingCustomer) {
            return res.status(400).json({ error: errorMessages.clientExists });
         }

         const newCustomer = await prisma.customer.create({
            data: {
               first_name,
               last_name,
               email,
               store_id,
               address_id,
               activebool: true,
               create_date: new Date(),
            },
         });

         res.status(201).json(newCustomer);
      } catch (error) {
         console.error(error);
         res.status(500).json({ error: errorMessages.genericError });
      }
   } else if (req.method === 'PUT') {
      try {
         const { customer_id, first_name, last_name, email } = req.body;

         if (!customer_id) {
            return res.status(400).json({ error: 'L\'id du client est requis.' });
         }

         if (!first_name || !last_name || !email) {
            return res.status(400).json({ error: 'Les champs first_name, last_name et email sont requis pour la mise à jour.' });
         }

         const existingCustomerWithEmail = await prisma.customer.findUnique({
            where: { email },
         });

         // Si l'email n'a pas changé ou appartient au même client
         if (existingCustomerWithEmail && existingCustomerWithEmail.customer_id !== customer_id) {
            return res.status(400).json({ error: errorMessages.emailInUse });
         }

         const updatedCustomer = await prisma.customer.update({
            where: { customer_id },
            data: {
               first_name,
               last_name,
               email,
            },
         });

         res.status(200).json(updatedCustomer);
      } catch (error) {
         console.error(error);
         res.status(500).json({ error: errorMessages.genericError });
      }
   } else {
      res.status(405).json({ error: 'Méthode HTTP non autorisée.' });
   }
}
