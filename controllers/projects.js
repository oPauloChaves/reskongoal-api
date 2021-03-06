const Project = require('../models/project')
const Task = require('../models/task')

function save (req, res, next) {
  req.assert('name', 'Name is required').notEmpty()

  req.getValidationResult().then(function (result) {
    if (!result.isEmpty()) {
      res.status(400).json({ errors: result.array() })
      return
    }

    const project = new Project({
      name: req.body.name,
      description: req.body.description,
      backgroundColor: req.body.backgroundColor,
      ownerId: req.user.id
    })

    project.save((err, project) => {
      if (err) {
        if (err.name === 'ValidationError') {
          err.status = 400
        }

        return next(err)
      }

      return res.json(project)
    })
  })
}

/**
 * Load a project given its id and user id
 */
function findById (req, res, next) {
  Project.get(req.params.projectId, req.user.id)
    .then(project => {
      return Task.findProjectTasks(req.params.projectId, req.user.id)
        .then(tasks => {
          res.json({ project, tasks })
        })
        .catch(err => next(err))
    })
    .catch(e => next(e))
}

function getTeamByProject (req, res, next) {
  Project.get(req.params.projectId, req.user.id)
    .then(project => {
      return res.json(project.team)
    })
    .catch(e => next(e))
}

function addMembersToTeam (req, res, next) {
  req.getValidationResult().then(function (result) {
    if (!result.isEmpty()) {
      res.status(400).json({ errors: result.array() })
      return
    }

    Project.get(req.params.projectId, req.user.id)
    .then(project => {
      let reqTeam = req.body.team
      let team = project.team

      // TODO assign default attr, like owner = false and role = DEV

      console.log(reqTeam)
      console.log(team)
      res.end()
    })
    .catch(e => next(e))
  })
}

/**
 * Get a list of projects of the user logged in
 */
function findByOwnerId (req, res, next) {
  Project.findByOwnerId(req.user.id)
    .then(projects => res.json(projects))
    .catch(e => next(e))
}

module.exports = {
  save,
  findById,
  findByOwnerId,
  getTeamByProject,
  addMembersToTeam
}
