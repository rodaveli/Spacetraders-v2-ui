import React, { useState, useEffect, useCallback } from 'react';
import { ForceGraph2D } from 'react-force-graph';
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

  const MiniMap = () => (
    <div style={{ width: '300px', height: '300px' }}>
      <ForceGraph2D
        graphData={{
          nodes: systems.map(system => ({
            id: system.symbol,
            color: system.type === 'NEUTRON_STAR' ? '#00ffff' : '#ffff00'
          })),
          links: []
        }}
        nodeRelSize={3}
        linkColor={() => 'rgba(255,255,255,0.2)'}
        onNodeClick={(node) => console.log('Clicked on system:', node.id)}
      />
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

      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">Fleet Overview</h2>
        <p>Total Ships: {ships.length}</p>
        <select 
          className="mt-2 p-2 border rounded"
          onChange={(e) => setSelectedShip(ships.find(ship => ship.symbol === e.target.value))}
        >
          <option value="">Select a ship</option>
          {ships.map(ship => (
            <option key={ship.symbol} value={ship.symbol}>{ship.symbol}</option>
          ))}
        </select>
        {selectedShip && (
          <div className="mt-2">
            <p>Selected Ship: {selectedShip.symbol}</p>
            <p>Status: {selectedShip.nav.status}</p>
            <p>Location: {selectedShip.nav.waypointSymbol}</p>
            {selectedShip.nav.status === 'IN_TRANSIT' && (
              <p>Arrival: {new Date(selectedShip.nav.route.arrival).toLocaleString()}</p>
            )}
            <div className="mt-2">
              <button 
                className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                onClick={() => handleShipAction('orbit', selectedShip.symbol)}
              >
                Orbit
              </button>
              <button 
                className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                onClick={() => handleShipAction('dock', selectedShip.symbol)}
              >
                Dock
              </button>
              <button 
                className="bg-yellow-500 text-white px-2 py-1 rounded"
                onClick={() => handleShipAction('extract', selectedShip.symbol)}
              >
                Extract
              </button>
            </div>
            <div className="mt-2">
              <button 
                className="bg-purple-500 text-white px-2 py-1 rounded"
                onClick={() => fetchMarketData(selectedShip.nav.systemSymbol, selectedShip.nav.waypointSymbol)}
              >
                View Market
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">Contracts</h2>
        {contracts.map(contract => (
          <div key={contract.id} className="mb-2 p-2 border rounded">
            <p>Type: {contract.type}</p>
            <p>Status: {contract.fulfilled ? 'Fulfilled' : 'Active'}</p>
            {!contract.accepted && (
              <button 
                className="bg-yellow-500 text-white px-2 py-1 rounded mt-1"
                onClick={() => handleContractAction('accept', contract.id)}
              >
                Accept Contract
              </button>
            )}
            {contract.accepted && !contract.fulfilled && (
              <button 
                className="bg-green-500 text-white px-2 py-1 rounded mt-1"
                onClick={() => handleContractAction('deliver', contract.id, selectedShip?.symbol, 'CARGO_SYMBOL', 10)}
              >
                Deliver Cargo
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">Mini Galaxy Map</h2>
        <MiniMap />
      </div>

      {marketData && (
        <div className="bg-white shadow-md rounded-lg p-4 col-span-2">
          <h2 className="text-xl font-semibold mb-2">Market Data</h2>
          <table className="w-full">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Supply</th>
                <th>Purchase Price</th>
                <th>Sell Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {marketData.tradeGoods.map(good => (
                <tr key={good.symbol}>
                  <td>{good.symbol}</td>
                  <td>{good.supply}</td>
                  <td>{good.purchasePrice}</td>
                  <td>{good.sellPrice}</td>
                  <td>
                    <button 
                      className="bg-green-500 text-white px-2 py-1 rounded"
                      onClick={() => handleSellCargo(selectedShip.symbol, good.symbol, 1)}
                    >
                      Sell 1
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;