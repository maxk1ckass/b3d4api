## 2019 11-12
-   fix: event handler setter interfaces should not block null values

## 2019 11-05
-   fix: if a request can't be made at all, sendRequest will return a rejected promise rather than null
-   fix: in sendRequest, we should register the request before sending it out
-   upd: change start connection interface start() to connect()
