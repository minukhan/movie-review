
import express from 'express'                                       // needed middleware installed in package.json
import MoviesController from './movies.controller.js'               // needed controller defined in movies.controller.js
import ReviewsController from './reviews.controller.js'
 
const router = express.Router()                                 

router.route('/').get(MoviesController.apiGetMovies)
router.route("/id/:id").get(MoviesController.apiGetMovieById)
router.route("/ratings").get(MoviesController.apiGetRatings)

router
    .route("/review")
    .post(ReviewsController.apiPostReview)
    .put(ReviewsController.apiUpdateReview)
    .delete(ReviewsController.apiDeleteReview)
 
export default router