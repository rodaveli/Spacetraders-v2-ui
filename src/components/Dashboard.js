import React, { useState, useEffect } from 'react';
import { getAgentData, getShips, getContracts } from '../utils/api';

const Dashboard = ({ token }) => {
  const [agentData, setAgentData] = useState(null);
  const [ships, setShips] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agent, shipsData, contractsData] = await Promise.all([
          getAgentData(token),
          getShips(token),
          getContracts(token)
        ]);
        setAgentData(agent.data);
        setShips(shipsData.data);
        setContracts(contractsData.data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchData();
  }, [token]);

  if (error) return <div>Error: {error}</div>;
  if (!agentData) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h2>Agent Info</h2>
      <p>Name: {agentData.symbol}</p>
      <p>Credits: {agentData.credits}</p>
      <h2>Ships: {ships.length}</h2>
      <h2>Contracts: {contracts.length}</h2>
    </div>
  );
};

export default Dashboard;