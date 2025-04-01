const errorHandler = (error, req, res, next) => {
  // could use for different errors -> if (error.name === '')
  //return res.status(400).json({ error: error.message })

  next(error)
}

module.exports = { errorHandler }