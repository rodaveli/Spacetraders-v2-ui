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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSystems();
    fetchShips();
  }, []);

  useEffect(() => {
    if (selectedShip) {
      fetchShipSystem(selectedShip.nav.systemSymbol);
    }
  }, [selectedShip]);

  const fetchSystems = async () => {
    setIsLoading(true);
    try {
      const response = await getSystems(token);
      setSystems(response.data);
    } catch (error) {
      logAction('Error fetching systems: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchShips = async () => {
    setIsLoading(true);
    try {
      const response = await getShips(token);
      setShips(response.data);
      if (response.data.length > 0) {
        selectShip(response.data[0].symbol);
      }
    } catch (error) {
      logAction('Error fetching ships: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchShipSystem = async (systemSymbol) => {
    setIsLoading(true);
    try {
      const response = await getSystem(token, systemSymbol);
      setSelectedSystem(response.data);
      fetchWaypoints(systemSymbol);
    } catch (error) {
      logAction('Error fetching ship system: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectSystem = async (systemSymbol) => {
    setIsLoading(true);
    try {
      const response = await getSystem(token, systemSymbol);
      setSelectedSystem(response.data);
      fetchWaypoints(systemSymbol);
    } catch (error) {
      logAction('Error fetching system details: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWaypoints = async (systemSymbol) => {
    setIsLoading(true);
    try {
      const response = await getWaypoints(token, systemSymbol);
      setWaypoints(response.data);
    } catch (error) {
      logAction('Error fetching waypoints: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectShip = async (shipSymbol) => {
    setIsLoading(true);
    try {
      const shipDetails = await getShips(token);
      const ship = shipDetails.data.find(s => s.symbol === shipSymbol);
      if (ship) {
        const navResponse = await getShipNav(token, shipSymbol);
        setSelectedShip({ ...ship, nav: navResponse.data });
      } else {
        throw new Error('Ship not found');
      }
    } catch (error) {
      logAction('Error fetching ship details: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrbit = async () => {
    if (!selectedShip) return;
    setIsLoading(true);
    try {
      await orbitShip(selectedShip.symbol);
      logAction(`${selectedShip.symbol} is now in orbit`);
      await selectShip(selectedShip.symbol);
    } catch (error) {
      logAction('Orbit error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDock = async () => {
    if (!selectedShip) return;
    setIsLoading(true);
    try {
      await dockShip(selectedShip.symbol);
      logAction(`${selectedShip.symbol} is now docked`);
      await selectShip(selectedShip.symbol);
    } catch (error) {
      logAction('Docking error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = async () => {
    if (!selectedShip || !selectedWaypoint) return;
    setIsLoading(true);
    try {
      await navigateShip(selectedShip.symbol, selectedWaypoint.symbol);
      logAction(`Navigating ${selectedShip.symbol} to ${selectedWaypoint.symbol}`);
      await selectShip(selectedShip.symbol);
    } catch (error) {
      logAction('Navigation error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJump = async () => {
    if (!selectedShip || !selectedSystem) return;
    setIsLoading(true);
    try {
      await jumpShip(selectedShip.symbol, selectedSystem.symbol);
      logAction(`${selectedShip.symbol} jumped to ${selectedSystem.symbol}`);
      await selectShip(selectedShip.symbol);
    } catch (error) {
      logAction('Jump error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWarp = async () => {
    if (!selectedShip || !selectedWaypoint) return;
    setIsLoading(true);
    try {
      await warpShip(selectedShip.symbol, selectedWaypoint.symbol);
      logAction(`${selectedShip.symbol} warped to ${selectedWaypoint.symbol}`);
      await selectShip(selectedShip.symbol);
    } catch (error) {
      logAction('Warp error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChart = async () => {
    if (!selectedShip) return;
    setIsLoading(true);
    try {
      const response = await createChart(selectedShip.symbol);
      logAction(`Created chart at ${selectedShip.nav.waypointSymbol}`);
      // You might want to update the waypoint information here
    } catch (error) {
      logAction('Charting error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanSystem = async () => {
    if (!selectedShip) return;
    setIsLoading(true);
    try {
      const response = await scanSystems(selectedShip.symbol);
      logAction(`Scanned systems from ${selectedShip.symbol}`);
      // You might want to update the systems information here
    } catch (error) {
      logAction('System scan error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanWaypoint = async () => {
    if (!selectedShip) return;
    setIsLoading(true);
    try {
      const response = await scanWaypoints(selectedShip.symbol);
      logAction(`Scanned waypoints from ${selectedShip.symbol}`);
      // You might want to update the waypoints information here
    } catch (error) {
      logAction('Waypoint scan error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefuel = async () => {
    if (!selectedShip) return;
    setIsLoading(true);
    try {
      await refuelShip(selectedShip.symbol);
      logAction(`Refueled ${selectedShip.symbol}`);
      await selectShip(selectedShip.symbol);
    } catch (error) {
      logAction('Refuel error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logAction = (message) => {
    setActionLog(prevLog => [...prevLog, { time: new Date().toLocaleTimeString(), message }]);
  };

  return (
    <div className="exploration-navigation">
      <h2>Exploration & Navigation</h2>
      
      <div className="systems-panel">
        <h3>Systems</h3>
        <select 
          onChange={(e) => selectSystem(e.target.value)} 
          disabled={isLoading}
          value={selectedSystem?.symbol || ''}
        >
          <option value="">Select a system</option>
          {systems.map(system => (
            <option key={system.symbol} value={system.symbol}>{system.symbol}</option>
          ))}
        </select>
      </div>

      <div className="ships-panel">
        <h3>Ships</h3>
        <select onChange={(e) => selectShip(e.target.value)} disabled={isLoading}>
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
          <button onClick={handleOrbit} disabled={isLoading || selectedShip.nav?.status !== 'DOCKED'}>Orbit</button>
          <button onClick={handleDock} disabled={isLoading || selectedShip.nav?.status !== 'IN_ORBIT'}>Dock</button>
          <button onClick={handleNavigate} disabled={isLoading || selectedShip.nav?.status !== 'IN_ORBIT' || !selectedWaypoint}>Navigate</button>
          <button onClick={handleJump} disabled={isLoading || selectedShip.nav?.status !== 'IN_ORBIT' || !selectedSystem}>Jump</button>
          <button onClick={handleWarp} disabled={isLoading || selectedShip.nav?.status !== 'IN_ORBIT' || !selectedWaypoint}>Warp</button>
          <button onClick={handleChart} disabled={isLoading}>Chart</button>
          <button onClick={handleScanSystem} disabled={isLoading}>Scan System</button>
          <button onClick={handleScanWaypoint} disabled={isLoading}>Scan Waypoint</button>
          <button onClick={handleRefuel} disabled={isLoading || selectedShip.nav?.status !== 'DOCKED'}>Refuel</button>
        </div>
      )}

      {selectedSystem && (
        <div className="system-info">
          <h3>System Information: {selectedSystem.symbol}</h3>
          <p>Type: {selectedSystem.type}</p>
          <p>Sector: {selectedSystem.sectorSymbol}</p>
          <p>Position: X: {selectedSystem.x}, Y: {selectedSystem.y}</p>
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

      {isLoading && <div className="loading-overlay">Loading...</div>}
    </div>
  );
};

export default ExplorationNavigation;