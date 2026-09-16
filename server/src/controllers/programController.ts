import { Request, Response } from 'express';
import Program from '../models/Program.js';
import ProgramParticipant from '../models/ProgramParticipant.js';
import { awardXP } from '../services/gamificationService.js';

// ─── Admin Endpoints ────────────────────────────

// @route   POST /api/programs
// @desc    Create a new program (admin only)
export const createProgram = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, rules, icon, color, habitToTrack, startDate, endDate, maxParticipants } = req.body;

    if (!title || !description || !habitToTrack || !startDate || !endDate) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }

    const program = await Program.create({
      title, description, rules, icon, color, habitToTrack,
      startDate, endDate, maxParticipants,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: program });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error creating program' });
  }
};

// @route   PUT /api/programs/:id
// @desc    Update a program (admin only)
export const updateProgram = async (req: Request, res: Response): Promise<void> => {
  try {
    const program = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!program) {
      res.status(404).json({ success: false, error: 'Program not found' });
      return;
    }
    res.json({ success: true, data: program });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error updating program' });
  }
};

// @route   DELETE /api/programs/:id
// @desc    Delete a program (admin only)
export const deleteProgram = async (req: Request, res: Response): Promise<void> => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);
    if (!program) {
      res.status(404).json({ success: false, error: 'Program not found' });
      return;
    }
    // Remove all participants
    await ProgramParticipant.deleteMany({ programId: req.params.id });
    res.json({ success: true, message: 'Program deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error deleting program' });
  }
};

// @route   GET /api/programs/admin/all
// @desc    List all programs with participant counts (admin only)
export const getAdminPrograms = async (req: Request, res: Response): Promise<void> => {
  try {
    const programs = await Program.find().sort({ createdAt: -1 }).populate('createdBy', 'name');
    const enriched = await Promise.all(
      programs.map(async (p) => {
        const participantCount = await ProgramParticipant.countDocuments({ programId: p._id });
        return { ...p.toObject(), participantCount };
      })
    );
    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching admin programs' });
  }
};

// ─── User Endpoints ─────────────────────────────

// @route   GET /api/programs
// @desc    List active programs
export const getPrograms = async (req: Request, res: Response): Promise<void> => {
  try {
    const programs = await Program.find({ isActive: true }).sort({ startDate: -1 });
    const enriched = await Promise.all(
      programs.map(async (p) => {
        const participantCount = await ProgramParticipant.countDocuments({ programId: p._id });
        const isJoined = await ProgramParticipant.exists({ programId: p._id, userId: req.user._id });
        return { ...p.toObject(), participantCount, isJoined: !!isJoined };
      })
    );
    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching programs' });
  }
};

// @route   GET /api/programs/my
// @desc    List programs user has joined
export const getMyPrograms = async (req: Request, res: Response): Promise<void> => {
  try {
    const participations = await ProgramParticipant.find({ userId: req.user._id })
      .populate('programId')
      .sort({ joinedAt: -1 });

    const enriched = await Promise.all(
      participations.map(async (p) => {
        const participantCount = await ProgramParticipant.countDocuments({ programId: (p.programId as any)._id });
        return { ...p.toObject(), participantCount };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching my programs' });
  }
};

// @route   GET /api/programs/:id
// @desc    Get program detail with leaderboard
export const getProgramDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const program = await Program.findById(req.params.id).populate('createdBy', 'name');
    if (!program) {
      res.status(404).json({ success: false, error: 'Program not found' });
      return;
    }

    const participantCount = await ProgramParticipant.countDocuments({ programId: program._id });
    const myParticipation = await ProgramParticipant.findOne({ programId: program._id, userId: req.user._id });

    // Top 10 leaderboard
    const leaderboard = await ProgramParticipant.find({ programId: program._id })
      .populate('userId', 'name avatar level settings')
      .sort({ completionRate: -1, totalDaysCompleted: -1 })
      .limit(10);

    const leaderboardData = leaderboard.map((p, i) => {
      const user = p.userId as any;
      return {
        rank: i + 1,
        userId: user._id,
        name: user.settings?.anonymousOnLeaderboard ? 'Anonymous' : user.name,
        avatar: user.avatar,
        level: user.level,
        currentStreak: p.currentStreak,
        completionRate: p.completionRate,
        totalDaysCompleted: p.totalDaysCompleted,
        isAnonymous: user.settings?.anonymousOnLeaderboard || false,
      };
    });

    res.json({
      success: true,
      data: {
        program: { ...program.toObject(), participantCount },
        myParticipation,
        leaderboard: leaderboardData,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching program detail' });
  }
};

// @route   POST /api/programs/:id/join
// @desc    Join a program
export const joinProgram = async (req: Request, res: Response): Promise<void> => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) {
      res.status(404).json({ success: false, error: 'Program not found' });
      return;
    }
    if (!program.isActive) {
      res.status(400).json({ success: false, error: 'Program is not active' });
      return;
    }

    const existing = await ProgramParticipant.findOne({ programId: program._id, userId: req.user._id });
    if (existing) {
      res.status(400).json({ success: false, error: 'Already joined this program' });
      return;
    }

    if (program.maxParticipants) {
      const count = await ProgramParticipant.countDocuments({ programId: program._id });
      if (count >= program.maxParticipants) {
        res.status(400).json({ success: false, error: 'Program is full' });
        return;
      }
    }

    const { linkedHabitId } = req.body;
    const participant = await ProgramParticipant.create({
      programId: program._id,
      userId: req.user._id,
      linkedHabitId: linkedHabitId || undefined,
    });

    res.status(201).json({ success: true, data: participant });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error joining program' });
  }
};

// @route   POST /api/programs/:id/leave
// @desc    Leave a program
export const leaveProgram = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await ProgramParticipant.findOneAndDelete({
      programId: req.params.id,
      userId: req.user._id,
    });
    if (!result) {
      res.status(404).json({ success: false, error: 'Not a participant of this program' });
      return;
    }
    res.json({ success: true, message: 'Left the program' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error leaving program' });
  }
};
