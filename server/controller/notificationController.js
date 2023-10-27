/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

const notificationService = require('../service/notificationService'); 


exports.addNotification = async ( req, res ) => {
  let success = await notificationService.addNotification( req.userId, req.message );
  if ( success ){
      res.set( "x-agora-message-title", "Success" );
      res.set( "x-agora-message-detail", "Notification added" );
      res.status( 200 ).json( "Success" );
  }
  else {
      const message = ApiMessage.createApiMessage( 404, "Not added", "Notification not added" );
      res.set( "x-agora-message-title", "Not added" );
      res.set( "x-agora-message-detail", "Notification not added" );
      res.status( 400 ).json( message );
  }
};

exports.deleteNotification =  async ( req, res ) => {
    let success =  notificationService.deleteNotification( req.notificationId )
    if ( success ){
        res.set( "x-agora-message-title", "Success" );
        res.set( "x-agora-message-detail", "Notification deleted" );
        res.status( 200 ).json( "Success" );
    }
    else {
      const message = ApiMessage.createApiMessage( 404, "Not Found", "Notification not found" );
      res.set( "x-agora-message-title", "Not Found" );
      res.set( "x-agora-message-detail", "Notification not found" );
      res.status( 400 ).json( message );
    }
}

exports.getNotifications = async ( req, res ) => {
    let authUserID;
    if ( req.user ) {
        authUserID = req.user.userId;
    }
    else if ( req.session.authUser ) {
        authUserID = req.session.authUser.userId;
    }
    if ( authUserID ){
      let success =  notificationService.getNotifications( authUserID );
      if ( success ){
          res.set( "x-agora-message-title", "Success" );
          res.set( "x-agora-message-detail", "Notifications received" );
          res.status( 200 ).json( "Success" );
      }
      else {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "Notifications not received" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "Notifications not found" );
        res.status( 400 ).json( message );
      }
    }
}
