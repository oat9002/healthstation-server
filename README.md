
| Method  | Path | Header | Description |
| ------------- | ------------- |:-------------------------------:|--------------------------------------------------|
| POST | \<serverURL:port\>/api/data/save/  | user_id<br/>Content-Type | To save health data to MongoDB |
| GET  | \<serverURL:port\>/api/data/allLatest/  | user_id | To get latest data of all health data types |
| GET  | \<serverURL:port\>/api/data/period/ | user_id<br/> period<br/> type | To get healtdata between 2 period of time |
| GET  | \<serverURL:port\>/api/data/latest/ | user_id<br/> type | To get latest data of 1 type of health data |
| POST | \<serverURL:port\>/api/auth/register/ | Register-Type<br/>Content-Type | To register user to system |
| GET  | \<serverURL:port\>/api/auth/login/ | Autherization:\<BasicAuth\> | To check if this user'd already registered in system|


**Register provider:**
POST /api/auth/register/provider

Header
```
    No Header because internal use only
```

Request body
```
{
	"name" : "KMITL",
    "address" : "ABC",
    "phone" : "08x-xxxxxxx",
    "fax" : "08x-xxxxxxx",
    "email":"xxx@kmitl.ac.th",
    "username" : "kmitl-test",
    "password" : "test1234"
}
```

Response body
```
{
    "key": "5ab289e0617057168c1b0770"
}
```

**Register station:**
POST /api/auth/register/station

Header
```
    x-provider-key: {{provider_key}}
```

Request body
```
{
	"name" : "KMITL_Station1"
}
```

Response body
```
{
    "station_key": "5ab28aa62dacd616beb4a58e"
}
```

**Register user by idcard:**
POST /api/auth/register/card

Header
```
    Authorization: Basic Authen of provider username and password
    X-Station-Key: {{station_key}}
```

Request body
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

Response body
```
{
    "token": "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "_id": {{mongoId}},
        "thaiFullName": "นาย รัฐภูมิ พุทธรักษา",
        "engFullName": "Mr.Rattapum Puttaraksa",
        "birthOfDate": "1990-10-10",
        "address": {
            "allow": true,
            "title": "กรุงเทพ"
        },
        "gender": "ชาย",
        "role": "patient",
        "firsttime": true
    }
}
```

**Register user fingerprint:**
POST /api/auth/register/fingerprint

Header
```
    Authorization: Basic Authen of provider username and password
    X-Station-Key: {{station_key}}
```

Request body
```
{
  "userId" : "5ab27a1eb8709a12525f21d9",
  "fingerPrint": [
	"ASDIJOIHUB123ONFIAN",
	"ASNFINFAIFAIPFSN312",
	"ASDPIAHIWONINOWUENU"
  ]
}
```

Response body
```
{
    "error": false
}
```

**Get user fingerprint:**
GET /api/data/fingerprint

Header
```
    Authorization: Basic Authen of provider username and password
    X-Station-Key: {{station_key}}
```

Response body
```
{
  "message": {
        "fingerprint": [
            {
                "updatedAt": "2018-03-21T15:41:03.063Z",
                "user": "5ab27a1eb8709a12525f21d9",
                "finger_print": [
                    "ASDIJOIHUB123ONFIAN",
                    "ASNFINFAIFAIPFSN312",
                    "ASDPIAHIWONINOWUENU"
                ]
            },
            ...
        ]
    }
}
```

**Login by username/password:**
GET /api/auth/login

first time login:
- username = {{id_number}}
- password = {{DateMonthYear}}

Header:
```
    Authorization: Basic Authen of user username and password
```

Response body
```
{
    "token": "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "_id": "5ab27a1eb8709a12525f21d9",
        "thaiFullName": "นาย รัฐภูมิ พุทธรักษา",
        "engFullName": "Mr.Rattapum Puttaraksa",
        "birthOfDate": "YYY-MM-DD",
        "address": {
            "allow": true,
            "title": "Bangkok Thailand"
        },
        "gender": "ชาย",
        "role": "patient",
        "about": {
            "address2": {
                "allow": false
            }
        },
        "about_patient": {},
        "firsttime": true
    }
}
```

**Login by fingerprint:**
GET /api/auth/login

Header:
```
    Authorization: Basic Authen of provider username and password
    x-station-key: {{station_key}}
    x-user-key: {{user_key}}
```

Response body
```
{
    "token": "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "_id": "5ab27a1eb8709a12525f21d9",
        "thaiFullName": "นาย รัฐภูมิ พุทธรักษา",
        "engFullName": "Mr.Rattapum Puttaraksa",
        "birthOfDate": "YYY-MM-DD",
        "address": {
            "allow": true,
            "title": "Bangkok Thailand"
        },
        "gender": "ชาย",
        "role": "patient",
        "about": {
            "address2": {
                "allow": false
            }
        },
        "about_patient": {},
        "firsttime": true
    }
}
```

**Health data**
GET /api/data/allLatest/

Header:
```
    Authorization: Basic Authen of user username and password
    user_id: {{user mongoId}}
```

Response body:
```
[
    {
        "body_height": {
            "value": 172,
            "unit": "cm"
        },
        "effective_time_frame": {
            "date_time": "2017-08-17T08:55:00Z"
        }
    },
    ...,
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

]
```

**Save health data**
POST

```
    user_id : {{user_key}}

```
Request body
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

Response body
```
{
    "error": false
}
```