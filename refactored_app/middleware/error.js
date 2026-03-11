// Error handling middleware to catch all unexpected errors 
const errorHandler = (err, req, res, next) => {
    console.error("Express Error Handler caught an error:", err.stack);

    // If headers were already sent, delegate to default express error handler
    if (res.headersSent) {
        return next(err);
    }

    // Standard structured error for API/server
    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
};

export default errorHandler;
