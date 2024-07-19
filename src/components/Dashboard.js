import React, { useState, useEffect, useCallback } from 'react';
import { 
  getAgentData, getShips, getContracts, getSystems, getShipNav,
  navigateShip, orbitShip, dockShip, deliverContract, acceptContract,
  extractResources, sellCargo, getMarket
} from '../utils/api';

const Dashboard = ({ token }) => {
  const [agent, setAgent] = useState(null);
  const [ships, setShips] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [systems, setSystems] = useState([]);
  const [selectedShip, setSelectedShip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marketData, setMarketData] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [agentData, shipsData, contractsData, systemsData] = await Promise.all([
        getAgentData(token),
        getShips(token),
        getContracts(token),
        getSystems(token, 100) // Fetch first 100 systems for the mini-map
      ]);

      setAgent(agentData.data);
      setShips(shipsData.data);
      setContracts(contractsData.data);
      setSystems(systemsData.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh data every 30 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  const updateShipStatus = useCallback(async (shipSymbol) => {
    try {
      const navData = await getShipNav(token, shipSymbol);
      setShips(prevShips => 
        prevShips.map(ship => 
          ship.symbol === shipSymbol ? { ...ship, nav: navData.data } : ship
        )
      );
    } catch (err) {
      console.error(`Error updating ship status for ${shipSymbol}:`, err);
    }
  }, [token]);

  useEffect(() => {
    if (selectedShip) {
      const interval = setInterval(() => updateShipStatus(selectedShip.symbol), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedShip, updateShipStatus]);

  const handleShipAction = async (action, shipSymbol, destination) => {
    try {
      let result;
      switch (action) {
        case 'navigate':
          result = await navigateShip(token, shipSymbol, destination);
          break;
        case 'orbit':
          result = await orbitShip(token, shipSymbol);
          break;
        case 'dock':
          result = await dockShip(token, shipSymbol);
          break;
        case 'extract':
          result = await extractResources(token, shipSymbol);
          break;
        default:
          throw new Error('Unknown action');
      }
      updateShipStatus(shipSymbol);
      alert(`Action ${action} completed successfully`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleContractAction = async (action, contractId, shipSymbol, tradeSymbol, units) => {
    try {
      switch (action) {
        case 'accept':
          await acceptContract(token, contractId);
          break;
        case 'deliver':
          await deliverContract(token, contractId, shipSymbol, tradeSymbol, units);
          break;
        default:
          throw new Error('Unknown action');
      }
      fetchData(); // Refresh data after contract action
      alert(`Contract action ${action} completed successfully`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSellCargo = async (shipSymbol, good, units) => {
    try {
      await sellCargo(token, shipSymbol, good, units);
      updateShipStatus(shipSymbol);
      alert(`Sold ${units} units of ${good} successfully`);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchMarketData = async (systemSymbol, waypointSymbol) => {
    try {
      const data = await getMarket(token, systemSymbol, waypointSymbol);
      setMarketData(data.data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Simple list for displaying systems
  const MiniMap = () => (
    <div className="max-h-60 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-2">Systems</h3>
      <ul>
        {systems.map(system => (
          <li key={system.symbol} className="mb-1">
            {system.symbol} - {system.type}
          </li>
        ))}
      </ul>
    </div>
  );

  if (isLoading) {
    return <div className="text-center mt-4">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">Agent Info</h2>
        <p>Name: {agent.symbol}</p>
        <p>Credits: {agent.credits}</p>
        <p>Headquarters: {agent.headquarters}</p>
      </div>

      {/* ... rest of the component remains the same */}
    </div>
  );
};

export default Dashboard;