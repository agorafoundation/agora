# Input Validation Middleware

Use this middleware to guarantee the shape of the req.body before it is used in your controllers.

## Usage

In a routes file, you may have something like this...

```js
router.route( '/workspace/:id' )
    // get a discussion based off workspace id
    .get( async ( req, res ) => {
        discussionController.getDiscussionByWorkspaceId( req, res );
    } )
    // update a discussion based off workspace id
    .patch(  
        async ( req, res ) => { 
            discussionController.updateDiscussionByWorkspaceId( req, res );
        } 
    )
    .post( 
        async ( req, res ) => {
            discussionController.createDiscussionByWorkspaceId( req, res );
        } 
    );
```

the expected req.body for updateDiscussionByWorkspaceId is
```json
{
  "discussion_text": "string"
}
```

the validate function in this folder utilizes a package called zod to verify the supplied request body from a client (UI, hoppscotch, ThunderClient) against a schema the developer creates

The corresponding zod schema to match the expect json body is
```js
const { z } = require( 'zod' );
/*---------Import Above----------*/
z.object({
  discussion_text: z.string()
});
```

This is only a basic example and zod offers support for many other data types and requirements, like length of a string, or min and max of a number. Read more about it here: https://zod.dev/

Integrating the validate function into your routes is simple, just add it as the argument before you call your controller, the previous example now becomes...

```js
router.route( '/workspace/:id' )
    // get a discussion based off workspace id
    .get( async ( req, res ) => {
        discussionController.getDiscussionByWorkspaceId( req, res );
    } )
    // update a discussion based off workspace id
    .patch( 
        validate( z.object( {discussion_text: z.string()} ) ), // <--- Here
        async ( req, res ) => { 
            discussionController.updateDiscussionByWorkspaceId( req, res );
        } 
    )
    .post( 
        validate( z.object( {discussion_text: z.string()} ) ), // <--- and Here
        async ( req, res ) => {
            discussionController.createDiscussionByWorkspaceId( req, res );
        } 
    );
```

Now, invalid requests to an API endpoint have improved error messages, in a standardized format. This is an example response for when someone forgets to supply a `discussion_text` property

```json
{
  "statusCode": 400,
  "messageTitle": "Bad Request",
  "messageBody": "Invalid type for discussion_text, expected string but got undefined"
}
```

You can refer to the discussionRoutes and discussionController files for more examples of how to implement this API