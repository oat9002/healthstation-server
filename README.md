

| Method  | Path | Header | Description |
| ------------- | ------------- |:-------------------------------:|--------------------------------------------------|
| POST | \<serverURL:port\>/api/data/save/  | user_id<br/>Content-Type | To save health data to MongoDB |
| GET  | \<serverURL:port\>/api/data/allLatest/  | user_id | To get latest data of all health data types |
| GET  | \<serverURL:port\>/api/data/period/ | user_id<br/> period<br/> type | To get healtdata between 2 period of time |
| GET  | \<serverURL:port\>/api/data/latest/ | user_id<br/> type | To get latest data of 1 type of health data |
| POST | \<serverURL:port\>/api/auth/register/ | Register-Type<br/>Content-Type | To register user to system |
| GET  | \<serverURL:port\>/api/auth/login/ | Autherization:\<BasicAuth\> | To check if this user'd already registered in system|


**user_id** : user id that u got from system<br/>
**period**  : define the period that you want to get the data. Have 2 period **week** and **month** <br/>
**type**    : type of health data **Heartrate, Bloodpressure, Temperature, Weight, Height**<br/>
**register-type** : use to define how user want to register with the system. **idcard, fingerprint**<br/>
**authorization\<BasicAuth\>** : BasicAuth is simple authen in format of Base64 string<br/>
**authorization\<JWT_Token\>** : JWT_token is long string. Use to check if are you already log in or not.<br/>


**Register:**

```
{
  "idNumber" : 1229900xxxxxx,
  "gender" : "male",
  "birthOfDate" : YY-MM-DD,
  "thaiFullName" : "นาย รัฐภูมิ พุทธรักษา",
  "engFullName" : "Mr.Rattapum Puttaraksa",
  "address" : "46/5 ม.6 ต.หนองชิ่ม อ.แหลมสิงห์ จ.จันทบุรี",
  "role": 'doctor'
}
```

**Health data**

> Body height
```
{
    "body_height": {
        "value": 172,
        "unit": "cm"
    },
    "effective_time_frame": {
        "date_time": "2017-08-17T08:55:00Z"
    }
}
```

> Body weight
```
{
    "body_height": {
        "value": 172,
        "unit": "kg"
    },
    "effective_time_frame": {
        "date_time": "2017-08-17T08:55:00Z"
    }
}
```

> Body temperature
```
{
    "body_temperature": {
        "value": 97,
        "unit": "C"
    },
    "effective_time_frame": {
        "date_time": "2013-02-05T07:25:00Z"
    }
}
```

> Heart rate
```
{
    "heart_rate": {
        "value": 55,
        "unit": "bpm"
    },
    "effective_time_frame": {
        "date_time": "2017-08-27T08:55:00Z"
    }
}
```

> Blood pressure
```
{
    "systolic_blood_pressure": {
        "value": 160,
        "unit": "mmHg"
    },
    "diastolic_blood_pressure": {
        "value": 65,
        "unit": "mmHg"
    },
    "effective_time_frame": {
        "date_time": "2018-02-22T07:25:00Z"
    }
}
```


