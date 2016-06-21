# sdw-immo-backend
Express Back-end (API)

API CRUD

**users**
  */users* [POST, GET]
  */users/:user_id* [GET, PUT, DELETE]
  */users/:user_id/sales* [GET]
  */users/:user_id/rents* [GET]
  */users/login* [POST]

**frontusers**
  */frontusers* [POST, GET]
  */frontusers/:frontuser_id* [GET, PUT, DELETE]
  */frontusers/:frontuser_id/sales* [GET]
  */frontusers/:frontuser_id/sales/:sale_id* [DELETE]
  */frontusers/:frontuser_id/rents* [GET]
  */frontusers/:frontuser_id/rents/:rent_id* [DELETE]
  */frontusers/login* [POST]

**agencies**
  */agencies* [POST, GET]
  */agencies/:agency_id* [GET, PUT, DELETE]
  */agencies/:agency_id/sales* [GET]
  */agencies/:agency_id/rents* [GET]

**sales**
  */sales* [POST, GET]
  */sales/:sale_id* [GET, PUT, DELETE]
  */sales/:sale_id/details* [POST, GET]
  */sales/:sale_id/details/:detail_id* [GET, PUT, DELETE]
  */sales/:sale_id/images* [POST, GET]
  */sales/:sale_id/images/:image_id* [GET, PUT, DELETE]

**rents**
  */rents* [POST, GET]
  */rents/:rent_id* [GET, PUT, DELETE]
  */rents/:rent_id/details* [POST, GET]
  */rents/:rent_id/details/:detail_id* [GET, PUT, DELETE]
  */rents/:rent_id/images* [POST, GET]
  */rents/:rent_id/images/:image_id* [GET, PUT, DELETE]

Hébergée sur http://sdw-immo-backend.herokuapp.com/
