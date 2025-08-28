require('dotenv').config();
const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
const User = require('./models/User');

async function fixAppointments() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bikefix';
    await mongoose.connect(mongoURI);
    console.log('Conectado ao MongoDB');
    
    // Verificar oficinas existentes
    const workshops = await User.find({ userType: 'workshop' });
    console.log('Oficinas encontradas:', workshops.length);
    workshops.forEach(w => {
      console.log('ID:', w._id, 'Nome:', w.businessName || w.name);
    });
    
    // Verificar agendamentos com workshop null
    const appointments = await Appointment.find().populate('workshop');
    console.log('\nTotal de agendamentos:', appointments.length);
    
    let nullWorkshops = 0;
    appointments.forEach(apt => {
      if (!apt.workshop) {
        console.log('Agendamento com workshop null:', apt._id, 'Workshop ID:', apt.workshop);
        nullWorkshops++;
      }
    });
    
    console.log('Agendamentos com workshop null:', nullWorkshops);
    
    // Se há oficinas, vamos atribuir a primeira oficina aos agendamentos órfãos
    if (workshops.length > 0 && nullWorkshops > 0) {
      const firstWorkshop = workshops[0];
      console.log('\nAtribuindo oficina', firstWorkshop._id, 'aos agendamentos órfãos...');
      
      // IDs dos agendamentos com workshop null
      const nullAppointmentIds = [
        '68af1da8bdf301bffb6e0e66',
        '68af1f55bdf301bffb6e1083', 
        '68af358123b59446a8a3a20c',
        '68af3b7323b59446a8a3a62d',
        '68af3c3823b59446a8a3a6a2'
      ];
      
      const result = await Appointment.updateMany(
        { _id: { $in: nullAppointmentIds } },
        { workshop: firstWorkshop._id }
      );
      
      console.log('Agendamentos atualizados:', result.modifiedCount);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

fixAppointments();