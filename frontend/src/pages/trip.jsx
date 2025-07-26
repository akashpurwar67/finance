import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTripStore } from '../store/useTripStore';
import {  Loader } from "lucide-react";

const TripListPage = () => {
  const { trips, fetchTrips, isLoading, createTrip,deleteTrip } = useTripStore();
  const [newTripName, setNewTripName] = useState('');
  const [participants, setParticipants] = useState(['']);
  const [emails, setEmails] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleAddParticipant = () => {
    if (participants.length < 10) { // Limit to 10 participants
      setParticipants([...participants, '']);
    }
  };

  const handleParticipantChange = (index, value) => {
    const updated = [...participants];
    updated[index] = value;
    setParticipants(updated);
  };

  const removeParticipant = (index) => {
    if (participants.length > 1) { // Keep at least one participant
      const updated = participants.filter((_, i) => i !== index);
      setParticipants(updated);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!newTripName.trim()) errors.tripName = 'Trip name is required';
    if (participants.some(p => !p.trim())) errors.participants = 'All participants must have names';
    if (participants.length < 1) errors.participants = 'At least one participant is required';
    return errors;
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await createTrip({
        name: newTripName,
        participants: participants.filter(p => p.trim()),
        emails
      });
      setNewTripName('');
      setParticipants(['']);
      setFormErrors({});
    } catch (error) {
      console.error('Error creating trip:', error);
      setFormErrors({ submit: 'Failed to create trip. Please try again.' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin h-10 w-10 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Your Trips</h1>

      {/* Create Trip Form */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6 border border-gray-100">
        <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-700">Create New Trip</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="trip-name" className="block text-sm font-medium text-gray-700 mb-1">
              Trip Name
            </label>
            <input
              id="trip-name"
              type="text"
              placeholder="e.g., Summer Vacation"
              value={newTripName}
              onChange={(e) => setNewTripName(e.target.value)}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.tripName ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {formErrors.tripName && (
              <p className="mt-1 text-sm text-red-600">{formErrors.tripName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Participants
            </label>
            {participants.map((p, i) => (
              <div key={i} className="flex items-center mb-2">
                <input
                  className={`flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.participants ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder={`Participant ${i + 1} Name`}
                  value={p}
                  onChange={(e) => handleParticipantChange(i, e.target.value)}
                />
                {participants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeParticipant(i)}
                    className="ml-2 p-2 text-red-500 hover:text-red-700"
                    aria-label="Remove participant"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            {formErrors.participants && (
              <p className="mt-1 text-sm text-red-600">{formErrors.participants}</p>
            )}
            <button
              type="button"
              onClick={handleAddParticipant}
              className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Participant
            </button>
          </div>
          <div>
            <label htmlFor="Emails" className="block text-sm font-medium text-gray-700 mb-1">
              Emails
            </label>
            <input
              id="emails"
              type="text"
              placeholder="Enter Emails to share trip"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.emails ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {formErrors.emails && (
              <p className="mt-1 text-sm text-red-600">{formErrors.emails}</p>
            )}
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Create Trip
            </button>
            {formErrors.submit && (
              <p className="mt-2 text-sm text-red-600 text-center">{formErrors.submit}</p>
            )}
          </div>
        </form>
      </div>

      {/* Trips List */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Trip History</h2>
        {trips.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No trips yet</h3>
            <p className="mt-2 text-gray-500">Create your first trip to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {trips.map(trip => (
              <div
                key={trip._id}
                className="bg-white p-4 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow relative"
              >
                {/* Delete Button */}
              
                  <button
                  onClick={(e) => {
                    
                      deleteTrip(trip._id);
                    
                  }}
                  className="absolute top-19 right-2 p-1 text-red-500 transition-colors"
                  aria-label="Delete trip"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                

                {/* Trip Content - Clickable Area */}
                <div
                  className="cursor-pointer"
                  onClick={() => navigate(`/trips/${trip._id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">{trip.name}</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">{trip.participants.length}</span> {trip.participants.length === 1 ? 'person' : 'people'} •{' '}
                        <span className="font-medium">{trip.expenses.length}</span> {trip.expenses.length === 1 ? 'expense' : 'expenses'}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {new Date(trip.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {trip.participants.slice(0, 3).map((p, i) => (
                      <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {p.split('@')[0]} {/* Show name before @ in email */}
                      </span>
                    ))}
                    {trip.participants.length > 3 && (
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                        +{trip.participants.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripListPage;