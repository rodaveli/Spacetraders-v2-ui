import React, { useState, useEffect } from 'react';
import './App.css';
import { getAgentData, getContracts, getServerStatus, getShips } from './utils/api';
import Dashboard from './components/Dashboard';
import FleetManagement from './components/FleetManagement';
import MarketTrading from './components/MarketTrading';
import ContractManagement from './components/ContractManagement';
import ExplorationAndNav from './components/ExplorationAndNav'; // Import the new component

const App = () => {
  const [agent, setAgent] = useState(null);
  const [serverReset, setServerReset] = useState(null);
  const [ships, setShips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(process.env.REACT_APP_SPACETRADERS_TOKEN);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [agentData, contractsData, statusData, shipsData] = await Promise.all([
          getAgentData(token),
          getContracts(token),
          getServerStatus(),
          getShips(token)
        ]);

        setAgent({
          name: agentData.data.symbol,
          credits: agentData.data.credits,
          shipCount: shipsData.data.length,
          contractCount: contractsData.data.length,
        });

        setShips(shipsData.data);
        setServerReset(new Date(statusData.serverResets.next));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">SpaceTraders Management System</h1>
      </div>
      <nav className="bg-blue-500 p-4">
        <button 
          className={`mr-4 ${activeTab === 'dashboard' ? 'font-bold' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`mr-4 ${activeTab === 'fleet' ? 'font-bold' : ''}`}
          onClick={() => setActiveTab('fleet')}
        >
          Fleet Management
        </button>
        <button 
          className={`mr-4 ${activeTab === 'market' ? 'font-bold' : ''}`}
          onClick={() => setActiveTab('market')}
        >
          Market Trading
        </button>
        <button 
          className={`mr-4 ${activeTab === 'contracts' ? 'font-bold' : ''}`}
          onClick={() => setActiveTab('contracts')}
        >
          Contract Management
        </button>
        <button 
          className={`mr-4 ${activeTab === 'exploration' ? 'font-bold' : ''}`}
          onClick={() => setActiveTab('exploration')}
        >
          Exploration & Navigation
        </button>
      </nav>
      <main className="container mx-auto p-4">
        {activeTab === 'dashboard' && agent && (
          <Dashboard 
            token={token}
            agent={agent}
            serverReset={serverReset}
            ships={ships}
          />
        )}
        {activeTab === 'fleet' && (
          <FleetManagement token={token} />
        )}
        {activeTab === 'market' && (
          <MarketTrading token={token} ships={ships} />
        )}
        {activeTab === 'contracts' && (
          <ContractManagement token={token} ships={ships} />
        )}
        {activeTab === 'exploration' && (
          <ExplorationAndNav token={token} ships={ships} />
        )}
      </main>
    </div>
  );
};

export default App;