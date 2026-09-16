import { Request, Response } from 'express';
import { getGlobalRankings, getWeeklyRankings, calculateConsistencyScore } from '../services/leaderboardService.js';
import ProgramParticipant from '../models/ProgramParticipant.js';

// @route   GET /api/leaderboard/global
// @desc    Global ranking by overall consistency score
export const getGlobalLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const rankings = await getGlobalRankings(limit);

    // Find current user's rank
    const myScore = await calculateConsistencyScore(req.user._id);
    const myRank = rankings.findIndex((r) => r.userId.toString() === req.user._id.toString()) + 1;

    res.json({
      success: true,
      data: {
        rankings,
        myRank: myRank || null,
        myScore: myScore.score,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching global leaderboard' });
  }
};

// @route   GET /api/leaderboard/weekly
// @desc    This week's most consistent users
export const getWeeklyLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const rankings = await getWeeklyRankings(limit);

    res.json({ success: true, data: { rankings } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching weekly leaderboard' });
  }
};

// @route   GET /api/leaderboard/program/:id
// @desc    Program-specific ranking
export const getProgramLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const participants = await ProgramParticipant.find({ programId: req.params.id })
      .populate('userId', 'name avatar level settings')
      .sort({ completionRate: -1, totalDaysCompleted: -1 });

    const rankings = participants.map((p, i) => {
      const user = p.userId as any;
      return {
        rank: i + 1,
        userId: user._id,
        name: user.settings?.anonymousOnLeaderboard ? 'Anonymous' : user.name,
        avatar: user.avatar,
        level: user.level,
        currentStreak: p.currentStreak,
        longestStreak: p.longestStreak,
        completionRate: p.completionRate,
        totalDaysCompleted: p.totalDaysCompleted,
        isAnonymous: user.settings?.anonymousOnLeaderboard || false,
      };
    });

    const myRank = rankings.findIndex((r) => r.userId.toString() === req.user._id.toString()) + 1;

    res.json({ success: true, data: { rankings, myRank: myRank || null } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching program leaderboard' });
  }
};
