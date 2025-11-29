router.delete('/clean-unverified', async (req, res) => {
  try {
    const result = await User.deleteMany({ isVerified: false });
    console.log('🧹 Deleted unverified users:', result.deletedCount);
    
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} unverified users`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      success: false,
      error: 'Cleanup failed'
    });
  }
});