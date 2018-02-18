

| Method  | Path | Header | Description |
| ------------- | ------------- |:-------------------------------:|--------------------------------------------------|
| POST | \<serverURL:port\>/api/data/save/  | user_id<br/>Content-Type | To save health data to MongoDB |
| GET  | \<serverURL:port\>/api/data/allLatest/  | user_id | To get latest data of all health data types |
| GET  | \<serverURL:port\>/api/data/period/ | user_id<br/> period<br/> type | To get healtdata between 2 period of time |
| GET  | \<serverURL:port\>/api/data/latest/ | user_id<br/> type | To get latest data of 1 type of health data |
| POST | \<serverURL:port\>/api/auth/register/ | Register-Type<br/>Content-Type | To register user to system |
| GET  | \<serverURL:port\>/api/auth/login/ | Autherization:\<BasicAuth\> | To check if this user'd already registered in system |
| GET  | \<serverURL:port\>/api/auth/protected/ | Authorization:\<JWT_token\> | To check JWT token if expired or not |


**user_id** : user id that u got from system<br/>
**period**  : define the period that you want to get the data. Have 2 period **week** and **month** <br/>
**type**    : type of health data **Heartrate, Bloodpressure, Temperature, Weight, Height**<br/>
**register-type** : use to define how user want to register with the system. **idcard, fingerprint**<br/>
**authorization\<BasicAuth\>** : BasicAuth is simple authen in format of Base64 string<br/>
**authorization\<JWT_Token\>** : JWT_token is long string. Use to check if are you already log in or not.<br/>
