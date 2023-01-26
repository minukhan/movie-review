import { ObjectId } from "mongodb"

let movies                                                              // movies stores reference to db
 
export default class MoviesDAO{     
                                        // export class MoviesDAO
    static async injectDB(conn){                                        // with async method injectDB
        if(movies){                                                     // if reference already exists
            return                                                      // return (don't need/want 2nd reference)
        }
        try{                                                            // else
            movies = await conn.db(process.env.MOVIEREVIEWS_NS)         // connect to the db name and
                        .collection('movies')                           // and the 'movies' collection within the db
        } 
        catch(e){                                                       // if getting connection to db fails
            console.error(`unable to connect in MoviesDAO: ${e}`)       // send error msg to console
        }
    }

    static async getMovies({                                            // async method getMovies which accepts
                                          // Possible filters are "title" and "rated"
        filters = null,
        page = 0,
        moviesPerPage = 20, // will only get 20 movies at once
    } = {}){
        let query                                                       // create query with filters object
        if(filters){ 
            if("title" in filters){                                     // does filters contain "title"??
                query = { $text: { $search: filters['title']}}          // if so search by title
            }else if("rated" in filters){                               // does filters contain "rated"??
                query = { "rated": { $eq: filters['rated']}}            // if so search by rated
            }                                
        }
 
        let cursor                                                      // find all movies that fit query & assign to cursor
        try{
            cursor = await movies
            .find(query)
            .limit(moviesPerPage)                                       // set cursor limit
            .skip(moviesPerPage * page)                                 // set cursor skip value
            const moviesList = await cursor.toArray()                   // set moviesList to cursor 
            const totalNumMovies = await movies.countDocuments(query)   // set totalNumMovies
            return {moviesList, totalNumMovies}                         // return moviesList & totalNumMovies
        }
        catch(e){                                                       // if there is any error just return
            console.error(`Unable to issue find command, ${e}`)         // empty moviesList and totalNumMovies=0
            return { moviesList: [], totalNumMovies: 0}
        }
    }

    static async getMovieById(id){


        try{
            return await movies.aggregate([
                {$match:{
                        _id : new ObjectId(id),
                    }

                }   ,
                {$lookup:
                    {
                        from : 'reviews',
                        localField:'_id',
                        foreignField: 'movie_id',
                        as:'reviews',
                    }
                }
            ]).next()
        }
        catch(e){
            console.error(`something went wrong in getMovieById: ${e}`)
            throw e
        }
    }



    static async GetRatings(){

        let ratings = []
        try{
            ratings = await movies.distinct("rated")
            return ratings
        }
        catch(e){
            console.error(`unable to get ratings, $(e)`)
            return ratings
        }
    }
}