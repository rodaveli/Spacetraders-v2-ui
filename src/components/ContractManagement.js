import React, { useState, useEffect } from 'react';
import { getContracts, acceptContract, deliverContract } from '../utils/api';

const ContractManagement = ({ token, ships }) => {
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    setIsLoading(true);
    try {
      const response = await getContracts(token);
      setContracts(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptContract = async (contractId) => {
    try {
      await acceptContract(token, contractId);
      fetchContracts(); // Refresh contracts after accepting
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeliverContract = async (contractId, shipSymbol, tradeSymbol, units) => {
    try {
      await deliverContract(token, contractId, shipSymbol, tradeSymbol, units);
      fetchContracts(); // Refresh contracts after delivering
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return <div>Loading contracts...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Contract Management</h2>
      {contracts.map(contract => (
        <div key={contract.id} className="mb-4 p-4 border rounded">
          <h3 className="text-xl font-semibold">{contract.type} Contract</h3>
          <p>Status: {contract.fulfilled ? 'Fulfilled' : contract.accepted ? 'In Progress' : 'Available'}</p>
          <p>Deadline: {new Date(contract.terms.deadline).toLocaleString()}</p>
          <p>Payment: {contract.terms.payment.onAccepted} (on accept) + {contract.terms.payment.onFulfilled} (on fulfill)</p>
          {contract.terms.deliver && (
            <div>
              <h4 className="font-semibold mt-2">Delivery Terms:</h4>
              {contract.terms.deliver.map((item, index) => (
                <p key={index}>
                  Deliver {item.unitsRequired} units of {item.tradeSymbol} to {item.destinationSymbol}
                </p>
              ))}
            </div>
          )}
          {!contract.accepted && (
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
              onClick={() => handleAcceptContract(contract.id)}
            >
              Accept Contract
            </button>
          )}
          {contract.accepted && !contract.fulfilled && (
            <div className="mt-2">
              <select className="p-2 border rounded mr-2">
                <option value="">Select a ship</option>
                {ships.map(ship => (
                  <option key={ship.symbol} value={ship.symbol}>{ship.symbol}</option>
                ))}
              </select>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={() => {
                  const selectedShip = document.querySelector('select').value;
                  const deliverItem = contract.terms.deliver[0]; // Assuming single delivery item for simplicity
                  handleDeliverContract(contract.id, selectedShip, deliverItem.tradeSymbol, deliverItem.unitsRequired);
                }}
              >
                Deliver Cargo
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ContractManagement;