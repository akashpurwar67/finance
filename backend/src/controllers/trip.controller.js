import Trip from '../models/trip.model.js';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import fs from 'fs';
import path from 'path';
export const createTrip = async (req, res) => {
    const { name, participants, emails } = req.body;
    try {
        if (!name || !participants || participants.length === 0) {
            return res.status(400).json({ message: 'Please provide trip name and participants' });
        }
        let ee = [];
        ee = emails.split(',').map(email => email.trim());
        const newTrip = new Trip({
            name,
            participants,
            userId: req.user._id,
            emails: ee
        });
        await newTrip.save();
        res.status(201).json(newTrip);
    } catch (error) {
        console.error('Error creating trip:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const fetchTrips = async (req, res) => {
    try {
        const userId = req.user._id;
        const userEmail = req.user.email;
        const trips = await Trip.find({
            $or: [
                { userId },
                { emails: userEmail }
            ]
        }).populate('userId', 'name email');
        res.status(200).json(trips);
    } catch (error) {
        console.error('Error fetching trips:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};
export const fetchTripById = async (req, res) => {
    const { id } = req.params;
    try {
        const trip = await Trip.findById(id).populate('userId', 'name email');
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        res.status(200).json(trip);
    } catch (error) {
        console.error('Error fetching trip by ID:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
}
export const addExpenseToTrip = async (req, res) => {
    const { id } = req.params;
    const { description, amount, paidBy } = req.body;
    try {
        const trip = await Trip.findById(id);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        const newExpense = { description, amount, paidBy };
        trip.expenses.push(newExpense);
        await trip.save();
        res.status(200).json(trip);
    } catch (error) {
        console.error('Error adding expense to trip:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
}

export const deleteTrip = async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    try {
        const trip = await Trip.findOneAndDelete({
            _id: id,
            userId: userId
        });
        if (!trip) {
            return res.status(404).json({ message: 'You cannot delete this trip' });
        }
        res.status(200).json({ message: 'Trip deleted successfully' });
    } catch (error) {
        console.error('Error deleting trip:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const uploadStatement = async (req, res) => {

    try {
        const filePath = path.join(process.cwd(), req.file.path);
        const fromDate = new Date(req.body.fromDate);
        const toDate = new Date(req.body.toDate);

        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        const text = data.text;
        

       const phonepeRegex = /(\w{3} \d{1,2}, \d{4})\s+(\d{1,2}:\d{2} [ap]m)\s+(DEBIT|CREDIT)₹([\d,]+)(?:Paid to|Received from) (.+?)\s/g;


        const transactions = [];
        let match;

        while ((match = phonepeRegex.exec(text)) !== null) {
            const [_, dateStr, timeStr, type, amt, recipient] = match;

            const fullDateStr = `${dateStr} ${timeStr}`;
            const date = new Date(fullDateStr);

            if (date >= fromDate && date <= toDate) {
                transactions.push({
                    date: fullDateStr,
                    description: `Paid to ${recipient.trim()}`,
                    type: type.toUpperCase(),
                    amount: parseFloat(amt.replace(/,/g, '')),
                });
            }
        }




        fs.unlinkSync(filePath); // delete after use
        console.log('Transactions extracted:', transactions);
        res.status(200).json({ transactions });
    } catch (err) {
        console.error('PDF Parse Error:', err.message);
        res.status(500).json({ message: 'Could not parse PDF' });
    }
};

