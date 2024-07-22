import React, { useState, useEffect } from 'react';
import { 
  getSystems, getSystem, getWaypoints, getWaypoint, 
  getShips, getShipNav, navigateShip, orbitShip, dockShip,
  jumpShip, warpShip, createChart, scanSystems, scanWaypoints,
  refuelShip
} from '../utils/api';

const ExplorationNavigation = ({ token }) => {
  const [systems, setSystems] = useState([]);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [selectedWaypoint, setSelectedWaypoint] = useState(null);
  const [ships, setShips] = useState([]);
  const [selectedShip, setSelectedShip] = useState(null);
  const [actionLog, setActionLog] = useState([]);

  useEffect(() => {
    fetchSystems();
    fetchShips();
  }, []);

  const fetchSystems = async () => {
    try {
      const response = await getSystems(token);
      setSystems(response.data);
    } catch (error) {
      logAction('Error fetching systems: ' + error.message);
    }
  };

  const fetchShips = async () => {
    try {
      const response = await getShips(token);
      setShips(response.data);
    } catch (error) {
      logAction('Error fetching ships: ' + error.message);
    }
  };

  const selectSystem = async (systemSymbol) => {
    try {
      const response = await getSystem(token, systemSymbol);
      setSelectedSystem(response.data);
      fetchWaypoints(systemSymbol);
    } catch (error) {
      logAction('Error fetching system details: ' + error.message);
    }
  };

  const fetchWaypoints = async (systemSymbol) => {
    try {
      const response = await getWaypoints(token, systemSymbol);
      setWaypoints(response.data);
    } catch (error) {
      logAction('Error fetching waypoints: ' + error.message);
    }
  };

  const selectWaypoint = async (waypointSymbol) => {
    try {
      const response = await getWaypoint(token, selectedSystem.symbol, waypointSymbol);
      setSelectedWaypoint(response.data);
    } catch (error) {
      logAction('Error fetching waypoint details: ' + error.message);
    }
  };

  const selectShip = async (shipSymbol) => {
    const ship = ships.find(s => s.symbol === shipSymbol);
    setSelectedShip(ship);
    try {
      const navResponse = await getShipNav(token, shipSymbol);
      setSelectedShip({ ...ship, nav: navResponse.data });
    } catch (error) {
      logAction('Error fetching ship navigation: ' + error.message);
    }
  };

  const navigate = async () => {
    if (!selectedShip || !selectedWaypoint) return;
    try {
      const response = await navigateShip(token, selectedShip.symbol, selectedWaypoint.symbol);
      logAction(`Navigating ${selectedShip.symbol} to ${selectedWaypoint.symbol}`);
      selectShip(selectedShip.symbol);
    } catch (error) {
      logAction('Navigation error: ' + error.message);
    }
  };

  const orbit = async () => {
    if (!selectedShip) return;
    try {
      const response = await orbitShip(token, selectedShip.symbol);
      logAction(`${selectedShip.symbol} is now in orbit`);
      selectShip(selectedShip.symbol);
    } catch (error) {
      logAction('Orbit error: ' + error.message);
    }
  };

  const dock = async () => {
    if (!selectedShip) return;
    try {
      const response = await dockShip(token, selectedShip.symbol);
      logAction(`${selectedShip.symbol} is now docked`);
      selectShip(selectedShip.symbol);
    } catch (error) {
      logAction('Docking error: ' + error.message);
    }
  };

  const jump = async () => {
    if (!selectedShip || !selectedWaypoint) return;
    try {
      const response = await jumpShip(token, selectedShip.symbol, selectedWaypoint.symbol);
      logAction(`${selectedShip.symbol} jumped to ${selectedWaypoint.symbol}`);
      selectShip(selectedShip.symbol);
    } catch (error) {
      logAction('Jump error: ' + error.message);
    }
  };

  const warp = async () => {
    if (!selectedShip || !selectedWaypoint) return;
    try {
      const response = await warpShip(token, selectedShip.symbol, selectedWaypoint.symbol);
      logAction(`${selectedShip.symbol} warped to ${selectedWaypoint.symbol}`);
      selectShip(selectedShip.symbol);
    } catch (error) {
      logAction('Warp error: ' + error.message);
    }
  };

  const chart = async () => {
    if (!selectedShip) return;
    try {
      const response = await createChart(token, selectedShip.symbol);
      logAction(`Created chart at ${selectedShip.nav.waypointSymbol}`);
      selectWaypoint(selectedShip.nav.waypointSymbol);
    } catch (error) {
      logAction('Charting error: ' + error.message);
    }
  };

  const scanSystem = async () => {
    if (!selectedShip) return;
    try {
      const response = await scanSystems(token, selectedShip.symbol);
      logAction(`Scanned systems from ${selectedShip.symbol}`);
      // Update systems or waypoints based on scan results
    } catch (error) {
      logAction('System scan error: ' + error.message);
    }
  };

  const scanWaypoint = async () => {
    if (!selectedShip) return;
    try {
      const response = await scanWaypoints(token, selectedShip.symbol);
      logAction(`Scanned waypoints from ${selectedShip.symbol}`);
      // Update waypoints based on scan results
    } catch (error) {
      logAction('Waypoint scan error: ' + error.message);
    }
  };

  const refuel = async () => {
    if (!selectedShip) return;
    try {
      const response = await refuelShip(token, selectedShip.symbol);
      logAction(`Refueled ${selectedShip.symbol}`);
      selectShip(selectedShip.symbol);
    } catch (error) {
      logAction('Refuel error: ' + error.message);
    }
  };

  const logAction = (message) => {
    setActionLog(prevLog => [...prevLog, { time: new Date().toLocaleTimeString(), message }]);
  };

  return (
    <div className="exploration-navigation">
      <div className="systems-panel">
        <h2>Systems</h2>
        <select onChange={(e) => selectSystem(e.target.value)}>
          <option value="">Select a system</option>
          {systems.map(system => (
            <option key={system.symbol} value={system.symbol}>{system.symbol}</option>
          ))}
        </select>
      </div>

      {selectedSystem && (
        <div className="waypoints-panel">
          <h2>Waypoints in {selectedSystem.symbol}</h2>
          <select onChange={(e) => selectWaypoint(e.target.value)}>
            <option value="">Select a waypoint</option>
            {waypoints.map(waypoint => (
              <option key={waypoint.symbol} value={waypoint.symbol}>{waypoint.symbol}</option>
            ))}
          </select>
        </div>
      )}

      <div className="ships-panel">
        <h2>Ships</h2>
        <select onChange={(e) => selectShip(e.target.value)}>
          <option value="">Select a ship</option>
          {ships.map(ship => (
            <option key={ship.symbol} value={ship.symbol}>{ship.symbol}</option>
          ))}
        </select>
      </div>

      {selectedShip && (
        <div className="ship-controls">
          <h3>{selectedShip.symbol}</h3>
          <p>Status: {selectedShip.nav?.status}</p>
          <p>Location: {selectedShip.nav?.waypointSymbol}</p>
          <p>Fuel: {selectedShip.fuel?.current}/{selectedShip.fuel?.capacity}</p>
          <button onClick={orbit} disabled={selectedShip.nav?.status !== 'DOCKED'}>Orbit</button>
          <button onClick={dock} disabled={selectedShip.nav?.status !== 'IN_ORBIT'}>Dock</button>
          <button onClick={navigate} disabled={selectedShip.nav?.status !== 'IN_ORBIT' || !selectedWaypoint}>Navigate</button>
          <button onClick={jump} disabled={selectedShip.nav?.status !== 'IN_ORBIT' || !selectedWaypoint}>Jump</button>
          <button onClick={warp} disabled={selectedShip.nav?.status !== 'IN_ORBIT' || !selectedWaypoint}>Warp</button>
          <button onClick={chart}>Chart</button>
          <button onClick={scanSystem}>Scan System</button>
          <button onClick={scanWaypoint}>Scan Waypoint</button>
          <button onClick={refuel} disabled={selectedShip.nav?.status !== 'DOCKED'}>Refuel</button>
        </div>
      )}

      {selectedWaypoint && (
        <div className="waypoint-info">
          <h3>{selectedWaypoint.symbol}</h3>
          <p>Type: {selectedWaypoint.type}</p>
          {/* Display more waypoint information here */}
        </div>
      )}

      <div className="action-log">
        <h3>Action Log</h3>
        <ul>
          {actionLog.map((log, index) => (
            <li key={index}>[{log.time}] {log.message}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ExplorationNavigation;