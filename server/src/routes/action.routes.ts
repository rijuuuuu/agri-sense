import { Router, Request, Response } from 'express';
import { dbStore } from '../services/db/store.js';
import { fetchFarmWeather } from '../services/weather/weather.service.js';
import { generateDailyFarmActions } from '../domain/actions/actions.engine.js';

export const actionRouter = Router();

// Get Today's Actions for the Active Farm
actionRouter.get('/today', async (req: Request, res: Response) => {
  try {
    const { farmId } = req.query;
    const farm = farmId ? dbStore.getFarmById(String(farmId)) : dbStore.getFarms()[0];

    if (!farm) {
      res.json({
        success: true,
        data: [],
        provenance: {
          source: 'AgriSense Action Engine',
          timestamp: new Date().toISOString(),
          mode: 'LIVE'
        }
      });
      return;
    }

    const cycles = dbStore.getCropCycles(farm.id);
    const activeCycle = cycles.find(c => c.status === 'active') || cycles[0];
    const soil = dbStore.getSoilProfile(farm.id);
    const water = dbStore.getWaterProfile(farm.id);

    // Live weather for action generation
    const weatherResult = await fetchFarmWeather(farm.latitude, farm.longitude, farm.villageDistrict);
    
    // Check if we already have tasks for today
    let tasks = dbStore.getTasks(farm.id);
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.dueDate === today);

    if (todayTasks.length === 0) {
      // Generate new tasks for today
      const generated = generateDailyFarmActions(farm, activeCycle, weatherResult.payload, soil, water);
      tasks = [...tasks, ...generated];
      dbStore.saveTasks(tasks);
    }

    res.json({
      success: true,
      data: tasks.filter(t => t.farmId === farm.id),
      provenance: {
        source: 'AgriSense Proactive Action Engine (Weather + Stage Driven)',
        timestamp: new Date().toISOString(),
        mode: 'LIVE'
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Action engine error';
    res.status(500).json({
      success: false,
      error: {
        code: 'ACTION_ENGINE_ERROR',
        message: msg,
        userFacingMessage: 'Failed to generate farm actions. Please check farm profile.'
      },
      provenance: {
        source: 'AgriSense Action Engine',
        timestamp: new Date().toISOString(),
        mode: 'LIVE'
      }
    });
  }
});

// Toggle Task Completion Status
actionRouter.patch('/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const task = dbStore.toggleTaskCompleted(id);

  if (!task) {
    res.status(404).json({
      success: false,
      error: {
        code: 'TASK_NOT_FOUND',
        message: `Task ${id} not found`,
        userFacingMessage: 'Task not found.'
      },
      provenance: {
        source: 'AgriSense Action Engine',
        timestamp: new Date().toISOString(),
        mode: 'LIVE'
      }
    });
    return;
  }

  res.json({
    success: true,
    data: task,
    provenance: {
      source: 'AgriSense Action Engine',
      timestamp: new Date().toISOString(),
      mode: 'LIVE'
    }
  });
});
