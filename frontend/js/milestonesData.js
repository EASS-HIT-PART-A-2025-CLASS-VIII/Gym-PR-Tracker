const MILESTONE_DEFINITIONS = [
    // --- STRENGTH: BENCH PRESS ---
    {
        id: 'bench_1',
        title: 'Bench Beginner',
        desc: 'Bench Press 60kg (1 plate)',
        icon: 'fitness_center',
        category: 'Strength',
        check: (stats) => stats.maxBench >= 60,
        progress: (stats) => Math.min((stats.maxBench / 60) * 100, 100),
        valueLabel: '60kg'
    },
    {
        id: 'bench_2',
        title: 'Bench Intermediate',
        desc: 'Bench Press 100kg (2 plates)',
        icon: 'fitness_center',
        category: 'Strength',
        check: (stats) => stats.maxBench >= 100,
        progress: (stats) => Math.min((stats.maxBench / 100) * 100, 100),
        valueLabel: '100kg'
    },
    {
        id: 'bench_3',
        title: 'Bench Master',
        desc: 'Bench Press 140kg (3 plates)',
        icon: 'fitness_center',
        category: 'Strength',
        check: (stats) => stats.maxBench >= 140,
        progress: (stats) => Math.min((stats.maxBench / 140) * 100, 100),
        valueLabel: '140kg'
    },

    // --- STRENGTH: SQUAT ---
    {
        id: 'squat_1',
        title: 'Squat Rookie',
        desc: 'Squat 100kg (2 plates)',
        icon: 'accessibility_new',
        category: 'Strength',
        check: (stats) => stats.maxSquat >= 100,
        progress: (stats) => Math.min((stats.maxSquat / 100) * 100, 100),
        valueLabel: '100kg'
    },
    {
        id: 'squat_2',
        title: 'Squat Pro',
        desc: 'Squat 140kg (3 plates)',
        icon: 'accessibility_new',
        category: 'Strength',
        check: (stats) => stats.maxSquat >= 140,
        progress: (stats) => Math.min((stats.maxSquat / 140) * 100, 100),
        valueLabel: '140kg'
    },
    {
        id: 'squat_3',
        title: 'Leg Day Hero',
        desc: 'Squat 180kg (4 plates)',
        icon: 'accessibility_new',
        category: 'Strength',
        check: (stats) => stats.maxSquat >= 180,
        progress: (stats) => Math.min((stats.maxSquat / 180) * 100, 100),
        valueLabel: '180kg'
    },

    // --- STRENGTH: DEADLIFT ---
    {
        id: 'dead_1',
        title: 'Deadlift Starter',
        desc: 'Deadlift 100kg',
        icon: 'vertical_align_top',
        category: 'Strength',
        check: (stats) => stats.maxDeadlift >= 100,
        progress: (stats) => Math.min((stats.maxDeadlift / 100) * 100, 100),
        valueLabel: '100kg'
    },
    {
        id: 'dead_2',
        title: 'Deadlift Beast',
        desc: 'Deadlift 180kg (4 plates)',
        icon: 'vertical_align_top',
        category: 'Strength',
        check: (stats) => stats.maxDeadlift >= 180,
        progress: (stats) => Math.min((stats.maxDeadlift / 180) * 100, 100),
        valueLabel: '180kg'
    },
    {
        id: 'dead_3',
        title: 'Deadlift King',
        desc: 'Deadlift 220kg (5 plates)',
        icon: 'vertical_align_top',
        category: 'Strength',
        check: (stats) => stats.maxDeadlift >= 220,
        progress: (stats) => Math.min((stats.maxDeadlift / 220) * 100, 100),
        valueLabel: '220kg'
    },

    // --- STRENGTH: OHP ---
    {
        id: 'ohp_1',
        title: 'Shoulders of Steel',
        desc: 'Overhead Press 60kg',
        icon: 'airline_seat_recline_extra',
        category: 'Strength',
        check: (stats) => stats.maxOHP >= 60,
        progress: (stats) => Math.min((stats.maxOHP / 60) * 100, 100),
        valueLabel: '60kg'
    },

    // --- VOLUME ---
    {
        id: 'vol_1',
        title: 'Getting Started',
        desc: 'Lift 1,000kg total volume',
        icon: 'scale',
        category: 'Volume',
        check: (stats) => stats.totalVolume >= 1000,
        progress: (stats) => Math.min((stats.totalVolume / 1000) * 100, 100),
        valueLabel: '1t'
    },
    {
        id: 'vol_2',
        title: '10 Ton Crusher',
        desc: 'Lift 10,000kg total volume',
        icon: 'scale',
        category: 'Volume',
        check: (stats) => stats.totalVolume >= 10000,
        progress: (stats) => Math.min((stats.totalVolume / 10000) * 100, 100),
        valueLabel: '10t'
    },
    {
        id: 'vol_3',
        title: 'Heavy Lifter',
        desc: 'Lift 100,000kg total volume',
        icon: 'scale',
        category: 'Volume',
        check: (stats) => stats.totalVolume >= 100000,
        progress: (stats) => Math.min((stats.totalVolume / 100000) * 100, 100),
        valueLabel: '100t'
    },
    {
        id: 'vol_4',
        title: 'Millionaire',
        desc: 'Lift 1,000,000kg total volume',
        icon: 'diamond',
        category: 'Volume',
        check: (stats) => stats.totalVolume >= 1000000,
        progress: (stats) => Math.min((stats.totalVolume / 1000000) * 100, 100),
        valueLabel: '1Mt'
    },

    // --- CONSISTENCY ---
    {
        id: 'cons_1',
        title: 'First Step',
        desc: 'Log your first PR',
        icon: 'flag',
        category: 'Consistency',
        check: (stats) => stats.totalPRs >= 1,
        progress: (stats) => Math.min((stats.totalPRs / 1) * 100, 100),
        valueLabel: '1 PR'
    },
    {
        id: 'cons_2',
        title: 'Regular',
        desc: 'Log 50 total PRs',
        icon: 'history',
        category: 'Consistency',
        check: (stats) => stats.totalPRs >= 50,
        progress: (stats) => Math.min((stats.totalPRs / 50) * 100, 100),
        valueLabel: '50 PRs'
    },
    {
        id: 'cons_3',
        title: 'Dedicated',
        desc: 'Log 100 total PRs',
        icon: 'verified',
        category: 'Consistency',
        check: (stats) => stats.totalPRs >= 100,
        progress: (stats) => Math.min((stats.totalPRs / 100) * 100, 100),
        valueLabel: '100 PRs'
    },
    {
        id: 'streak_1',
        title: 'Heating Up',
        desc: 'Log PRs 3 weeks in a row',
        icon: 'local_fire_department',
        category: 'Consistency',
        check: (stats) => stats.currentStreak >= 3,
        progress: (stats) => Math.min((stats.currentStreak / 3) * 100, 100),
        valueLabel: '3 Wks'
    },
    {
        id: 'streak_2',
        title: 'On Fire',
        desc: 'Log PRs 10 weeks in a row',
        icon: 'local_fire_department',
        category: 'Consistency',
        check: (stats) => stats.currentStreak >= 10,
        progress: (stats) => Math.min((stats.currentStreak / 10) * 100, 100),
        valueLabel: '10 Wks'
    },

    // --- VARIETY ---
    {
        id: 'var_1',
        title: 'Well Rounded',
        desc: 'Log a PR for Chest, Legs, and Back',
        icon: 'pie_chart',
        category: 'Variety',
        check: (stats) => stats.musclesTrained.has('Chest') && stats.musclesTrained.has('Legs') && stats.musclesTrained.has('Back'),
        progress: (stats) => {
            let c = 0;
            if (stats.musclesTrained.has('Chest')) c++;
            if (stats.musclesTrained.has('Legs')) c++;
            if (stats.musclesTrained.has('Back')) c++;
            return (c / 3) * 100;
        },
        valueLabel: '3/3'
    },
    {
        id: 'var_2',
        title: 'Specialist',
        desc: 'Log 10 PRs for a single muscle group',
        icon: 'star',
        category: 'Variety',
        check: (stats) => stats.maxSingleMuscleCount >= 10,
        progress: (stats) => Math.min((stats.maxSingleMuscleCount / 10) * 100, 100),
        valueLabel: '10 PRs'
    },
    {
        id: 'misc_1',
        title: 'Early Bird',
        desc: 'Log a workout before 8AM',
        icon: 'wb_twilight',
        category: 'Misc',
        check: (stats) => stats.hasEarlyMorningPR,
        progress: (stats) => stats.hasEarlyMorningPR ? 100 : 0,
        valueLabel: 'Done'
    }
];
