import React, { useState, useEffect, useCallback } from 'react';
import { 
  getShips, 
  getShipDetails, 
  purchaseShip, 
  scrapShip, 
  repairShip, 
  refuelShip,
  navigateShip,
  dockShip,
  orbitShip
} from '../utils/api';

const FleetManagement = ({ token }) => {
  const [ships, setShips] = useState([]);
  const [selectedShip, setSelectedShip] = useState(null);
  const [availableShips, setAvailableShips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchShips = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getShips(token);
      setShips(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchShips();
  }, [fetchShips]);

  const handleShipSelect = async (shipSymbol) => {
    try {
      const response = await getShipDetails(token, shipSymbol);
      setSelectedShip(response.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePurchaseShip = async (shipType) => {
    try {
      // For this example, we're using a placeholder waypoint. In a real app, you'd want to select an appropriate waypoint.
      const waypointSymbol = "X1-TEST-WAYPOINT";
      await purchaseShip(token, shipType, waypointSymbol);
      fetchShips();
      alert(`Successfully purchased ${shipType}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleScrapShip = async (shipSymbol) => {
    try {
      await scrapShip(token, shipSymbol);
      fetchShips();
      setSelectedShip(null);
      alert(`Successfully scrapped ship ${shipSymbol}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRepairShip = async (shipSymbol) => {
    try {
      await repairShip(token, shipSymbol);
      handleShipSelect(shipSymbol);
      alert(`Successfully repaired ship ${shipSymbol}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRefuelShip = async (shipSymbol) => {
    try {
      await refuelShip(token, shipSymbol);
      handleShipSelect(shipSymbol);
      alert(`Successfully refueled ship ${shipSymbol}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNavigateShip = async (shipSymbol, waypointSymbol) => {
    try {
      await navigateShip(token, shipSymbol, waypointSymbol);
      handleShipSelect(shipSymbol);
      alert(`Ship ${shipSymbol} is now navigating to ${waypointSymbol}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDockShip = async (shipSymbol) => {
    try {
      await dockShip(token, shipSymbol);
      handleShipSelect(shipSymbol);
      alert(`Ship ${shipSymbol} has docked`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOrbitShip = async (shipSymbol) => {
    try {
      await orbitShip(token, shipSymbol);
      handleShipSelect(shipSymbol);
      alert(`Ship ${shipSymbol} is now in orbit`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return <div className="text-center mt-4">Loading fleet data...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Your Fleet</h2>
        <ul className="space-y-2">
          {ships.map((ship) => (
            <li 
              key={ship.symbol} 
              className="cursor-pointer hover:bg-gray-100 p-2 rounded"
              onClick={() => handleShipSelect(ship.symbol)}
            >
              {ship.symbol} - {ship.registration.role}
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Purchase New Ship</h3>
          <select 
            className="p-2 border rounded mr-2"
            onChange={(e) => handlePurchaseShip(e.target.value)}
          >
            <option value="">Select a ship type</option>
            <option value="SHIP_MINING_DRONE">Mining Drone</option>
            <option value="SHIP_INTERCEPTOR">Interceptor</option>
            <option value="SHIP_LIGHT_HAULER">Light Hauler</option>
            <option value="SHIP_COMMAND_FRIGATE">Command Frigate</option>
          </select>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={() => handlePurchaseShip(document.querySelector('select').value)}
          >
            Purchase
          </button>
        </div>
      </div>
      {selectedShip && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Ship Details</h2>
          <p><strong>Symbol:</strong> {selectedShip.symbol}</p>
          <p><strong>Role:</strong> {selectedShip.registration.role}</p>
          <p><strong>Fuel:</strong> {selectedShip.fuel.current}/{selectedShip.fuel.capacity}</p>
          <p><strong>Condition:</strong> {selectedShip.frame.condition}%</p>
          <p><strong>Location:</strong> {selectedShip.nav.waypointSymbol}</p>
          <p><strong>Status:</strong> {selectedShip.nav.status}</p>
          {selectedShip.nav.status === 'IN_TRANSIT' && (
            <p><strong>Arrival:</strong> {new Date(selectedShip.nav.route.arrival).toLocaleString()}</p>
          )}
          <div className="mt-4 space-x-2">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => handleRepairShip(selectedShip.symbol)}
            >
              Repair
            </button>
            <button
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              onClick={() => handleRefuelShip(selectedShip.symbol)}
            >
              Refuel
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={() => handleScrapShip(selectedShip.symbol)}
            >
              Scrap
            </button>
          </div>
          <div className="mt-4 space-x-2">
            <button
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              onClick={() => handleDockShip(selectedShip.symbol)}
            >
              Dock
            </button>
            <button
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
              onClick={() => handleOrbitShip(selectedShip.symbol)}
            >
              Orbit
            </button>
          </div>
          <div className="mt-4">
            <input 
              type="text" 
              placeholder="Enter waypoint symbol" 
              className="p-2 border rounded mr-2"
            />
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              onClick={() => handleNavigateShip(selectedShip.symbol, document.querySelector('input[type="text"]').value)}
            >
              Navigate
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetManagement;