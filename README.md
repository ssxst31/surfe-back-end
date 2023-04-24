## 🏄‍♂️ 서피 API 명세서

**API 호스트**

👉🏻 [`https://api.surfe.store`](https://api.surfe.store)

<br>

## 스키마

### 유저

```javascript
{
	user_id: Number,
	email: String,
	nickname: String,
	password: String,
  profile: String
}
```

- nickname: 미정
- 이메일 형식 올바르게
- 비밀번호: 8글자 이상

### 친구목록

```javascript
{
	id: Number,
	senderId: Number,
	receiverId: Number
}
```

## API 요청 요약

#### Host

- [`https://api.surfe.store`](https://api.surfe.store)

#### Auth

- 회원가입 : `POST/auth/signup`
- 로그인 : `POST/auth/login`
- 로그아웃 : `POST/auth/logout`

#### My

- 내 정보 : `GET/my/profile`
- 내 위치 : `POST/my/location`
- 프로필 : `POST/my/upload`
- 친구 목록 : `POST/my/friends`
- 친구 삭제 : `POST/my/friends/cancel`
- 친구 요청 목록 : `POST/my/friend-requests`

#### 유저 목록

- 가까운 이웃 목록 : `GET/users/nearby`
- 특정 id의 유저 : `GET/users/profile/:id`

<br>
