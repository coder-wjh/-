// pages/video/video.js
import request from '../../utils/request' 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList:[], //导航标签数据
    navId: '', //导航标识
    videoList: '', //视频的列表数据
    videoId: '', //视频id标识
    videoUpdateTime: [], //记录video播放的时长
    isTrtiggered: false, //标识下拉刷新是否被触发
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取导航标签的数据
    this.getVideoGroupListData()
  },

  // 获取导航数据
  async getVideoGroupListData(){
    let videoGroupListData = await request('/video/group/list',{},'get')
    this.setData({
      videoGroupList: videoGroupListData.data.slice(0,14),
      navId: videoGroupListData.data[0].id
    })

    // 获取视频列表的数据
    this.getVideoList(this.data.navId)
  },

  // 获取视频列表数据
  async getVideoList(navId){
    let videoListData = await request('/video/group',{id:navId},'get')
    // 关闭消息提示框
    wx.hideLoading()

    let index = 0
    let videoList = videoListData.datas.map(item => {
      item.id = index++
      return item
    }) 
    
    this.setData({
      videoList,
      isTrtiggered: false // 关闭下拉刷新
    })
  },

  // 点击切换导航的回调
  changeNav(event){
    let navId = event.currentTarget.id // 通过id向event传参时，如果是number会自动转换为string
    // let navId = event.currentTarget.dataset.id
    this.setData({
      navId: navId>>>0
    })

    this.setData({
      videoList: []
    })

    // 显示正在加载
    wx.showLoading({
      title:'正在加载'
    })

    // 动态获取当前导航对应的视频数据
    this.getVideoList(this.data.navId)

  },

  // 点击播放/继续播放的回调
  handlePlay(event){
    /* 
      需求：
        1.点击播放事件中需要找到上一个播放的视频
        2.在播放新的视频之前关闭上一个正在播放的视频
      关键：
        1.如何找到上一个视频的实例对象
        2.如何确认点击播放的视频和正在播放的视频不是同一个视频
      单例模式：
        1.需要创建多个对象的场景下，通过一个变量接受，始终保持只有一个对象
    */

    let vid = event.currentTarget.id
    // 关闭上一个播放的视频
    // this.vid !== vid && this.videoContent && this.videoContent.stop() 
    // this.vid = vid

    // 更新data中videoId的状态数据
    this.setData({
      videoId: vid
    })
    // 创建控制video标签的实例对象
    this.videoContent = wx.createVideoContext(vid)
    // 判断当前的视频之前是否播放过，是否有播放记录，如果有，跳转至指定的播放位置
    let {videoUpdateTime} = this.data
    let videoItem = videoUpdateTime.find(item => item.vid === vid)
    if(videoItem){
      this.videoContent.seek(videoItem.currentTime)
    }

    this.videoContent.play()
  },

  // 监听视频播放进度的回调
  handleTimeUpdate(event){
    let videoTimeObj = {vid: event.currentTarget.id,currentTime: event.detail.currentTime}
    let {videoUpdateTime} = this.data
    /* 
      思路：判断记录播放时长的videoUpdateTime数组是否有当前视频的播放记录
        1. 如果有，在原有的播放记录中修改播放时间为当前的播放时间
        2. 如果没有，需要在数组中添加当前视频的播放对象

    */
    let videoItem = videoUpdateTime.find(item =>item.vid === videoTimeObj.vid)
    if(videoItem){
      // 之前有
      videoItem.currentTime = event.detail.currentTime
    }else{
      videoUpdateTime.push(videoTimeObj)
    }
    // 更新videoUpdateTime的状态
    this.setData({
      videoUpdateTime
    })
  },

  // 视频播放结束调用的回调
  handleEnded(event){
    console.log('end');
    // 移除记录播放时长数组中当前视频的对象
    let {videoUpdateTime} = this.data
    videoUpdateTime.splice(videoUpdateTime.findIndex(item => item.vid === event.currentTarget.id),1)
    this.setData({
      videoUpdateTime
    })
  },

  // 自定义下拉刷新的回调：scroll-view
  handleRefresher(){
    // 再次发请求，获取最新的视频列表数据
    this.getVideoList(this.data.navId)
  },

  // 自定义上拉触底的回调 scroll-view
  handleToLower(){
    console.log('下拉加载更多');
    // 数据分页： 1.后端分页 2.前端分页
    console.log('发送请求 || 在前端截取最新的数据，追加到视频列表的后方');
    console.log('网易云暂时没有提供分页的api');
    let newVideoList = [
      {
          "type": 1,
          "displayed": false,
          "alg": "onlineHotGroup",
          "extAlg": null,
          "data": {
              "alg": "onlineHotGroup",
              "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
              "threadId": "R_VI_62_EF6FA6BF4DAA06F6092EC58D1BBFEE54",
              "coverUrl": "https://p2.music.126.net/SnP8PGMgz96z4byAO9jU8Q==/109951163572747184.jpg",
              "height": 720,
              "width": 1280,
              "title": "OMFG《Hello》还能这么玩？这是爱因斯坦搭建的设备吧！",
              "description": "OMFG《Hello》还能这么玩？这是爱因斯坦搭建的设备吧！",
              "commentCount": 2308,
              "shareCount": 5844,
              "resolutions": [
                  {
                      "resolution": 240,
                      "size": 26178107
                  },
                  {
                      "resolution": 480,
                      "size": 37372216
                  },
                  {
                      "resolution": 720,
                      "size": 59503293
                  }
              ],
              "creator": {
                  "defaultAvatar": false,
                  "province": 1000000,
                  "authStatus": 0,
                  "followed": false,
                  "avatarUrl": "http://p1.music.126.net/eFO91z0r8UH8vyvgVvouLA==/109951164396527565.jpg",
                  "accountStatus": 0,
                  "gender": 0,
                  "city": 1004400,
                  "birthday": 960566400000,
                  "userId": 18607052,
                  "userType": 204,
                  "nickname": "YouTube",
                  "signature": "音乐视频自媒体",
                  "description": "",
                  "detailDescription": "",
                  "avatarImgId": 109951164396527570,
                  "backgroundImgId": 109951164396712980,
                  "backgroundUrl": "http://p1.music.126.net/1gy0zRB-546TO16XI9WW5Q==/109951164396712971.jpg",
                  "authority": 0,
                  "mutual": false,
                  "expertTags": null,
                  "experts": {
                      "1": "泛生活视频达人",
                      "2": "生活图文达人"
                  },
                  "djStatus": 10,
                  "vipType": 11,
                  "remarkName": null,
                  "backgroundImgIdStr": "109951164396712971",
                  "avatarImgIdStr": "109951164396527565",
                  "avatarImgId_str": "109951164396527565"
              },
              "urlInfo": {
                  "id": "EF6FA6BF4DAA06F6092EC58D1BBFEE54",
                  "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/CdWF0MqU_73612670_shd.mp4?ts=1608903830&rid=3009063014E119FC636C42FBC02D0085&rl=3&rs=pOpZlgAnPrAqkYAfrKimGCCFaZYRrois&sign=564a5fe6eb9482f6fff45b4820bc959c&ext=f0xw0mOJqGcf8yfMQn4khLo0vOAZ2Oret6FDS9VvANLm%2FGUb1QPWIQLEJa2U4krgnnzZ5qg4r5v8aen%2FH72GGUUtqDWu3rLAjrSCkL3qwfTH2gjY0D6juLC8uZ%2F1yvsOr0NDvkIg064g7qMMHLj40lTAp8UnGFi%2FhQ%2FPIoSZkdF0SONWh4ZG7fepQM%2FZ8Kj4%2BygglxTAK%2FotIC7j2KlMNXXWkaiCoDoIULCGuMTkfdsFZcKdomWbN80TLGIYlYLb",
                  "size": 59503293,
                  "validityTime": 1200,
                  "needPay": false,
                  "payInfo": null,
                  "r": 720
              },
              "videoGroup": [
                  {
                      "id": -31410,
                      "name": "#〖电萌〗打游戏专用#",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 15229,
                      "name": "英语",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 15149,
                      "name": "创意音乐",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 9104,
                      "name": "电子",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 13164,
                      "name": "快乐",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 4104,
                      "name": "电音",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 23116,
                      "name": "音乐推荐",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 5100,
                      "name": "音乐",
                      "alg": "groupTagRank"
                  }
              ],
              "previewUrl": null,
              "previewDurationms": 0,
              "hasRelatedGameAd": false,
              "markTypes": null,
              "relateSong": [
                  {
                      "name": "Hello",
                      "id": 33211676,
                      "pst": 0,
                      "t": 0,
                      "ar": [
                          {
                              "id": 381949,
                              "name": "OMFG",
                              "tns": [],
                              "alias": []
                          }
                      ],
                      "alia": [],
                      "pop": 100,
                      "st": 0,
                      "rt": null,
                      "fee": 8,
                      "v": 54,
                      "crbt": null,
                      "cf": "",
                      "al": {
                          "id": 3190201,
                          "name": "Hello",
                          "picUrl": "http://p3.music.126.net/sylTociq8lh0QP7BuXRLGQ==/109951164852190706.jpg",
                          "tns": [],
                          "pic_str": "109951164852190706",
                          "pic": 109951164852190700
                      },
                      "dt": 226307,
                      "h": {
                          "br": 320000,
                          "fid": 0,
                          "size": 9055129,
                          "vd": -72865
                      },
                      "m": {
                          "br": 192000,
                          "fid": 0,
                          "size": 5433095,
                          "vd": -70531
                      },
                      "l": {
                          "br": 128000,
                          "fid": 0,
                          "size": 3622078,
                          "vd": -69149
                      },
                      "a": null,
                      "cd": "1",
                      "no": 1,
                      "rtUrl": null,
                      "ftype": 0,
                      "rtUrls": [],
                      "djId": 0,
                      "copyright": 0,
                      "s_id": 0,
                      "cp": 1416729,
                      "mv": 5309845,
                      "rurl": null,
                      "mst": 9,
                      "rtype": 0,
                      "publishTime": 1416672000000,
                      "privilege": {
                          "id": 33211676,
                          "fee": 8,
                          "payed": 0,
                          "st": 0,
                          "pl": 128000,
                          "dl": 0,
                          "sp": 7,
                          "cp": 1,
                          "subp": 1,
                          "cs": false,
                          "maxbr": 999000,
                          "fl": 128000,
                          "toast": false,
                          "flag": 4,
                          "preSell": false
                      }
                  }
              ],
              "relatedInfo": null,
              "videoUserLiveInfo": null,
              "vid": "EF6FA6BF4DAA06F6092EC58D1BBFEE54",
              "durationms": 224095,
              "playTime": 1972728,
              "praisedCount": 19674,
              "praised": false,
              "subscribed": false
          }
      },
      {
          "type": 1,
          "displayed": false,
          "alg": "onlineHotGroup",
          "extAlg": null,
          "data": {
              "alg": "onlineHotGroup",
              "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
              "threadId": "R_VI_62_EC2754784AE7D14BE771DE3512A6524F",
              "coverUrl": "https://p2.music.126.net/4KscUCojMvbkawAqPXPM_A==/109951163093734404.jpg",
              "height": 720,
              "width": 1280,
              "title": "AC/DC 最棒现场之一《T.N.T.》",
              "description": "AC/DC 最棒现场之一《T.N.T.》，1991年 Donington 现场。",
              "commentCount": 126,
              "shareCount": 404,
              "resolutions": [
                  {
                      "resolution": 240,
                      "size": 24846367
                  },
                  {
                      "resolution": 480,
                      "size": 35493775
                  },
                  {
                      "resolution": 720,
                      "size": 56712129
                  }
              ],
              "creator": {
                  "defaultAvatar": false,
                  "province": 1000000,
                  "authStatus": 0,
                  "followed": false,
                  "avatarUrl": "http://p1.music.126.net/7WeGjE1-0la_QOVPMbEQgw==/109951163766123110.jpg",
                  "accountStatus": 0,
                  "gender": 1,
                  "city": 1003100,
                  "birthday": -1568390400000,
                  "userId": 36902160,
                  "userType": 204,
                  "nickname": "因为李伯伯的屁股大",
                  "signature": "满足你们的窥视欲。",
                  "description": "",
                  "detailDescription": "",
                  "avatarImgId": 109951163766123100,
                  "backgroundImgId": 109951162935037810,
                  "backgroundUrl": "http://p1.music.126.net/sXyjaA6I43B4btLcPaJnNg==/109951162935037808.jpg",
                  "authority": 0,
                  "mutual": false,
                  "expertTags": null,
                  "experts": {
                      "1": "音乐视频达人",
                      "2": "摇滚资讯达人"
                  },
                  "djStatus": 10,
                  "vipType": 11,
                  "remarkName": null,
                  "backgroundImgIdStr": "109951162935037808",
                  "avatarImgIdStr": "109951163766123110",
                  "avatarImgId_str": "109951163766123110"
              },
              "urlInfo": {
                  "id": "EC2754784AE7D14BE771DE3512A6524F",
                  "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/b3De5p0n_99628059_shd.mp4?ts=1608903830&rid=3009063014E119FC636C42FBC02D0085&rl=3&rs=njopPYMtPaMiljlVKnlVnWdSJpKcZQmn&sign=0e30fdeef8663b6b94c8f735460a3cce&ext=f0xw0mOJqGcf8yfMQn4khLo0vOAZ2Oret6FDS9VvANLm%2FGUb1QPWIQLEJa2U4krgnnzZ5qg4r5v8aen%2FH72GGUUtqDWu3rLAjrSCkL3qwfTH2gjY0D6juLC8uZ%2F1yvsOr0NDvkIg064g7qMMHLj40lTAp8UnGFi%2FhQ%2FPIoSZkdF0SONWh4ZG7fepQM%2FZ8Kj4%2BygglxTAK%2FotIC7j2KlMNXXWkaiCoDoIULCGuMTkfdsFZcKdomWbN80TLGIYlYLb",
                  "size": 56712129,
                  "validityTime": 1200,
                  "needPay": false,
                  "payInfo": null,
                  "r": 720
              },
              "videoGroup": [
                  {
                      "id": -10549,
                      "name": "#锤子科技历年新品发布会音乐汇总#",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 9104,
                      "name": "电子",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 14146,
                      "name": "兴奋",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 16131,
                      "name": "英文",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 4104,
                      "name": "电音",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 1100,
                      "name": "音乐现场",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 58100,
                      "name": "现场",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 5100,
                      "name": "音乐",
                      "alg": "groupTagRank"
                  }
              ],
              "previewUrl": null,
              "previewDurationms": 0,
              "hasRelatedGameAd": false,
              "markTypes": null,
              "relateSong": [
                  {
                      "name": "T.N.T.",
                      "id": 3881059,
                      "pst": 0,
                      "t": 0,
                      "ar": [
                          {
                              "id": 85502,
                              "name": "AC/DC",
                              "tns": [],
                              "alias": []
                          }
                      ],
                      "alia": [],
                      "pop": 85,
                      "st": 0,
                      "rt": "",
                      "fee": 8,
                      "v": 8,
                      "crbt": null,
                      "cf": "",
                      "al": {
                          "id": 392651,
                          "name": "TNT",
                          "picUrl": "http://p4.music.126.net/_V-vJjrtdq-4y_0LqTNaaQ==/805942023205198.jpg",
                          "tns": [],
                          "pic": 805942023205198
                      },
                      "dt": 215000,
                      "h": {
                          "br": 320000,
                          "fid": 0,
                          "size": 8602688,
                          "vd": -8900
                      },
                      "m": {
                          "br": 192000,
                          "fid": 0,
                          "size": 5161630,
                          "vd": -6500
                      },
                      "l": {
                          "br": 128000,
                          "fid": 0,
                          "size": 3441101,
                          "vd": -4900
                      },
                      "a": null,
                      "cd": "1",
                      "no": 5,
                      "rtUrl": null,
                      "ftype": 0,
                      "rtUrls": [],
                      "djId": 0,
                      "copyright": 1,
                      "s_id": 0,
                      "cp": 7001,
                      "mv": 0,
                      "rurl": null,
                      "mst": 9,
                      "rtype": 0,
                      "publishTime": 186595200007,
                      "privilege": {
                          "id": 3881059,
                          "fee": 8,
                          "payed": 0,
                          "st": 0,
                          "pl": 128000,
                          "dl": 0,
                          "sp": 7,
                          "cp": 1,
                          "subp": 1,
                          "cs": false,
                          "maxbr": 320000,
                          "fl": 128000,
                          "toast": false,
                          "flag": 256,
                          "preSell": false
                      }
                  }
              ],
              "relatedInfo": null,
              "videoUserLiveInfo": null,
              "vid": "EC2754784AE7D14BE771DE3512A6524F",
              "durationms": 209723,
              "playTime": 168053,
              "praisedCount": 1145,
              "praised": false,
              "subscribed": false
          }
      },
      {
          "type": 1,
          "displayed": false,
          "alg": "onlineHotGroup",
          "extAlg": null,
          "data": {
              "alg": "onlineHotGroup",
              "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
              "threadId": "R_VI_62_79FE09EF692B018A1980184856A8A680",
              "coverUrl": "https://p2.music.126.net/j3NBjc0Hd0UcKOx9jb4Kyg==/109951163573089451.jpg",
              "height": 720,
              "width": 1280,
              "title": "【震撼灵魂电音Grace惊鸿！】1分10秒即刻点燃你的灵魂",
              "description": "",
              "commentCount": 676,
              "shareCount": 1614,
              "resolutions": [
                  {
                      "resolution": 240,
                      "size": 41112971
                  },
                  {
                      "resolution": 480,
                      "size": 68232238
                  },
                  {
                      "resolution": 720,
                      "size": 114188715
                  }
              ],
              "creator": {
                  "defaultAvatar": false,
                  "province": 230000,
                  "authStatus": 0,
                  "followed": false,
                  "avatarUrl": "http://p1.music.126.net/vZv3XQ-ZShrCvPvRk9VLVA==/19089720881779731.jpg",
                  "accountStatus": 0,
                  "gender": 0,
                  "city": 230600,
                  "birthday": -2209017600000,
                  "userId": 292210748,
                  "userType": 204,
                  "nickname": "漫小贱-音乐壁纸",
                  "signature": "今日头条号【漫漫漫小贱】动漫短视频以及高清动漫美图壁纸~",
                  "description": "",
                  "detailDescription": "",
                  "avatarImgId": 19089720881779732,
                  "backgroundImgId": 109951163642471760,
                  "backgroundUrl": "http://p1.music.126.net/6--vSyNwQQqHHsZelW0Abg==/109951163642471763.jpg",
                  "authority": 0,
                  "mutual": false,
                  "expertTags": null,
                  "experts": {
                      "1": "二次元原创视频达人"
                  },
                  "djStatus": 0,
                  "vipType": 0,
                  "remarkName": null,
                  "backgroundImgIdStr": "109951163642471763",
                  "avatarImgIdStr": "19089720881779731",
                  "avatarImgId_str": "19089720881779731"
              },
              "urlInfo": {
                  "id": "79FE09EF692B018A1980184856A8A680",
                  "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/66MpLlBH_1339203073_shd.mp4?ts=1608903830&rid=3009063014E119FC636C42FBC02D0085&rl=3&rs=GfzfQESuDBzRbSBeFtzOWgiXkrULnnTX&sign=9876d972a8da57e1de2a2700b981f012&ext=f0xw0mOJqGcf8yfMQn4khLo0vOAZ2Oret6FDS9VvANLm%2FGUb1QPWIQLEJa2U4krgnnzZ5qg4r5v8aen%2FH72GGUUtqDWu3rLAjrSCkL3qwfTH2gjY0D6juLC8uZ%2F1yvsOr0NDvkIg064g7qMMHLj40lTAp8UnGFi%2FhQ%2FPIoSZkdF0SONWh4ZG7fepQM%2FZ8Kj4%2BygglxTAK%2FotIC7j2KlMNXXWkaiCoDoIULCGuMTkfdsFZcKdomWbN80TLGIYlYLb",
                  "size": 114188715,
                  "validityTime": 1200,
                  "needPay": false,
                  "payInfo": null,
                  "r": 720
              },
              "videoGroup": [
                  {
                      "id": 9104,
                      "name": "电子",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 13164,
                      "name": "快乐",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 4104,
                      "name": "电音",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 14212,
                      "name": "欧美音乐",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 4103,
                      "name": "演奏",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 23116,
                      "name": "音乐推荐",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 5100,
                      "name": "音乐",
                      "alg": "groupTagRank"
                  }
              ],
              "previewUrl": null,
              "previewDurationms": 0,
              "hasRelatedGameAd": false,
              "markTypes": null,
              "relateSong": [
                  {
                      "name": "Grace",
                      "id": 528423473,
                      "pst": 0,
                      "t": 0,
                      "ar": [
                          {
                              "id": 12065179,
                              "name": "Jannik",
                              "tns": [],
                              "alias": []
                          }
                      ],
                      "alia": [
                          "惊鸿"
                      ],
                      "pop": 100,
                      "st": 0,
                      "rt": null,
                      "fee": 8,
                      "v": 61,
                      "crbt": null,
                      "cf": "",
                      "al": {
                          "id": 37115871,
                          "name": "Grace",
                          "picUrl": "http://p4.music.126.net/TY3o-xrOeL5l2ZcWZ-btcQ==/109951163100529767.jpg",
                          "tns": [],
                          "pic_str": "109951163100529767",
                          "pic": 109951163100529760
                      },
                      "dt": 299942,
                      "h": {
                          "br": 320000,
                          "fid": 0,
                          "size": 12000697,
                          "vd": -28800
                      },
                      "m": {
                          "br": 192000,
                          "fid": 0,
                          "size": 7200435,
                          "vd": -26400
                      },
                      "l": {
                          "br": 128000,
                          "fid": 0,
                          "size": 4800305,
                          "vd": -24800
                      },
                      "a": null,
                      "cd": "01",
                      "no": 1,
                      "rtUrl": null,
                      "ftype": 0,
                      "rtUrls": [],
                      "djId": 0,
                      "copyright": 0,
                      "s_id": 0,
                      "cp": 0,
                      "mv": 5799056,
                      "rurl": null,
                      "mst": 9,
                      "rtype": 0,
                      "publishTime": 1515084133998,
                      "privilege": {
                          "id": 528423473,
                          "fee": 8,
                          "payed": 0,
                          "st": 0,
                          "pl": 128000,
                          "dl": 0,
                          "sp": 7,
                          "cp": 1,
                          "subp": 1,
                          "cs": false,
                          "maxbr": 999000,
                          "fl": 128000,
                          "toast": false,
                          "flag": 66,
                          "preSell": false
                      }
                  }
              ],
              "relatedInfo": null,
              "videoUserLiveInfo": null,
              "vid": "79FE09EF692B018A1980184856A8A680",
              "durationms": 300351,
              "playTime": 759844,
              "praisedCount": 6920,
              "praised": false,
              "subscribed": false
          }
      },
      {
          "type": 1,
          "displayed": false,
          "alg": "onlineHotGroup",
          "extAlg": null,
          "data": {
              "alg": "onlineHotGroup",
              "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
              "threadId": "R_VI_62_5BA78963FED600CA2D8072CABCDA3ABA",
              "coverUrl": "https://p2.music.126.net/UAOLGcnStTY_LQC9TmvAig==/109951163573086031.jpg",
              "height": 720,
              "width": 1280,
              "title": "嗨爆了！Zedd现场演绎热单《Beautiful Now》",
              "description": "嗨爆了！Zedd现场演绎热单《Beautiful Now》",
              "commentCount": 1197,
              "shareCount": 5502,
              "resolutions": [
                  {
                      "resolution": 240,
                      "size": 29911039
                  },
                  {
                      "resolution": 480,
                      "size": 42706989
                  },
                  {
                      "resolution": 720,
                      "size": 67965956
                  }
              ],
              "creator": {
                  "defaultAvatar": false,
                  "province": 500000,
                  "authStatus": 1,
                  "followed": false,
                  "avatarUrl": "http://p1.music.126.net/KfJZpZygZF6sjmLY0pR-qQ==/109951163656815709.jpg",
                  "accountStatus": 0,
                  "gender": 1,
                  "city": 500101,
                  "birthday": 798048000000,
                  "userId": 115390585,
                  "userType": 4,
                  "nickname": "怪兽Sound",
                  "signature": "泥嚎，我是一只热爱电音的怪兽，长期致力于分享优质歌曲，音乐资讯、传播正能量。",
                  "description": "",
                  "detailDescription": "",
                  "avatarImgId": 109951163656815710,
                  "backgroundImgId": 18888510254061304,
                  "backgroundUrl": "http://p1.music.126.net/qX2PR1Z-PgKFCPkWo-RBuA==/18888510254061305.jpg",
                  "authority": 0,
                  "mutual": false,
                  "expertTags": [
                      "电子",
                      "流行"
                  ],
                  "experts": null,
                  "djStatus": 10,
                  "vipType": 11,
                  "remarkName": null,
                  "backgroundImgIdStr": "18888510254061305",
                  "avatarImgIdStr": "109951163656815709",
                  "avatarImgId_str": "109951163656815709"
              },
              "urlInfo": {
                  "id": "5BA78963FED600CA2D8072CABCDA3ABA",
                  "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/sOmkX1F8_1335389580_shd.mp4?ts=1608903830&rid=3009063014E119FC636C42FBC02D0085&rl=3&rs=HrUqGZCqhZMyNfYvbWdcrNMDlRZPJkJY&sign=98a895d274902a151ec9e44e43f5220a&ext=f0xw0mOJqGcf8yfMQn4khLo0vOAZ2Oret6FDS9VvANLm%2FGUb1QPWIQLEJa2U4krgnnzZ5qg4r5v8aen%2FH72GGUUtqDWu3rLAjrSCkL3qwfTH2gjY0D6juLC8uZ%2F1yvsOr0NDvkIg064g7qMMHLj40lTAp8UnGFi%2FhQ%2FPIoSZkdF0SONWh4ZG7fepQM%2FZ8Kj4%2BygglxTAK%2FotIC7j2KlMNXXWkaiCoDoIULCGuMTkfdtbrlRLSZo6SBgv2TFIAiGh",
                  "size": 67965956,
                  "validityTime": 1200,
                  "needPay": false,
                  "payInfo": null,
                  "r": 720
              },
              "videoGroup": [
                  {
                      "id": -8010,
                      "name": "#999+评论#",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 25130,
                      "name": "Zedd",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 13172,
                      "name": "欧美",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 14146,
                      "name": "兴奋",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 9104,
                      "name": "电子",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 13164,
                      "name": "快乐",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 4104,
                      "name": "电音",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 57106,
                      "name": "欧美现场",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 4103,
                      "name": "演奏",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 1100,
                      "name": "音乐现场",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 58100,
                      "name": "现场",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 5100,
                      "name": "音乐",
                      "alg": "groupTagRank"
                  }
              ],
              "previewUrl": null,
              "previewDurationms": 0,
              "hasRelatedGameAd": false,
              "markTypes": null,
              "relateSong": [
                  {
                      "name": "Beautiful Now",
                      "id": 32019002,
                      "pst": 0,
                      "t": 0,
                      "ar": [
                          {
                              "id": 46376,
                              "name": "Zedd",
                              "tns": [],
                              "alias": []
                          },
                          {
                              "id": 860113,
                              "name": "Jon Bellion",
                              "tns": [],
                              "alias": []
                          }
                      ],
                      "alia": [],
                      "pop": 100,
                      "st": 0,
                      "rt": null,
                      "fee": 1,
                      "v": 113,
                      "crbt": null,
                      "cf": "",
                      "al": {
                          "id": 3119381,
                          "name": "True Colors",
                          "picUrl": "http://p4.music.126.net/ze_ggtReuHBLF2o-wUolFw==/109951163221161145.jpg",
                          "tns": [],
                          "pic_str": "109951163221161145",
                          "pic": 109951163221161150
                      },
                      "dt": 218293,
                      "h": {
                          "br": 320000,
                          "fid": 0,
                          "size": 8734346,
                          "vd": -26099
                      },
                      "m": {
                          "br": 192000,
                          "fid": 0,
                          "size": 5240625,
                          "vd": -23599
                      },
                      "l": {
                          "br": 128000,
                          "fid": 0,
                          "size": 3493764,
                          "vd": -22300
                      },
                      "a": null,
                      "cd": "1",
                      "no": 3,
                      "rtUrl": null,
                      "ftype": 0,
                      "rtUrls": [],
                      "djId": 0,
                      "copyright": 2,
                      "s_id": 0,
                      "cp": 7003,
                      "mv": 420471,
                      "rurl": null,
                      "mst": 9,
                      "rtype": 0,
                      "publishTime": 1431964800007,
                      "privilege": {
                          "id": 32019002,
                          "fee": 1,
                          "payed": 0,
                          "st": 0,
                          "pl": 0,
                          "dl": 0,
                          "sp": 0,
                          "cp": 0,
                          "subp": 0,
                          "cs": false,
                          "maxbr": 999000,
                          "fl": 0,
                          "toast": false,
                          "flag": 1028,
                          "preSell": false
                      }
                  }
              ],
              "relatedInfo": null,
              "videoUserLiveInfo": null,
              "vid": "5BA78963FED600CA2D8072CABCDA3ABA",
              "durationms": 251100,
              "playTime": 2951054,
              "praisedCount": 19509,
              "praised": false,
              "subscribed": false
          }
      },
      {
          "type": 1,
          "displayed": false,
          "alg": "onlineHotGroup",
          "extAlg": null,
          "data": {
              "alg": "onlineHotGroup",
              "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
              "threadId": "R_VI_62_683624483A2D516C7968D97115EC2542",
              "coverUrl": "https://p2.music.126.net/C9V6SGjggm6mmNwnye5E-A==/109951163573183277.jpg",
              "height": 720,
              "width": 1280,
              "title": "【盘点五首】硬核到底可以有多炸？非常炸！",
              "description": "无聊的时候做了个视频，来水视频的你们看看就好哈哈哈哈哈哈哈哈哈哈哈哈哈哈\n记得关注我的B站哦 EDMDROPS-PYZ\n\n",
              "commentCount": 539,
              "shareCount": 627,
              "resolutions": [
                  {
                      "resolution": 240,
                      "size": 16937409
                  },
                  {
                      "resolution": 480,
                      "size": 24567582
                  },
                  {
                      "resolution": 720,
                      "size": 38396644
                  }
              ],
              "creator": {
                  "defaultAvatar": false,
                  "province": 440000,
                  "authStatus": 0,
                  "followed": false,
                  "avatarUrl": "http://p1.music.126.net/kcvJa-nc5LMx12Kxs-_ljg==/109951164855294154.jpg",
                  "accountStatus": 0,
                  "gender": 2,
                  "city": 440300,
                  "birthday": 930024000000,
                  "userId": 87447015,
                  "userType": 0,
                  "nickname": "KOVENSH",
                  "signature": "",
                  "description": "",
                  "detailDescription": "",
                  "avatarImgId": 109951164855294160,
                  "backgroundImgId": 109951163895955650,
                  "backgroundUrl": "http://p1.music.126.net/0K5sP7cgl_nV16qovnt6MA==/109951163895955654.jpg",
                  "authority": 0,
                  "mutual": false,
                  "expertTags": null,
                  "experts": null,
                  "djStatus": 0,
                  "vipType": 11,
                  "remarkName": null,
                  "backgroundImgIdStr": "109951163895955654",
                  "avatarImgIdStr": "109951164855294154",
                  "avatarImgId_str": "109951164855294154"
              },
              "urlInfo": {
                  "id": "683624483A2D516C7968D97115EC2542",
                  "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/FISLNZY2_1367617621_shd.mp4?ts=1608903830&rid=3009063014E119FC636C42FBC02D0085&rl=3&rs=SAlUxbnsudDFnwyeQiVMznWTPYBuSNeH&sign=2843a622f26ed6e0d232ad3672c31461&ext=f0xw0mOJqGcf8yfMQn4khLo0vOAZ2Oret6FDS9VvANLm%2FGUb1QPWIQLEJa2U4krgnnzZ5qg4r5v8aen%2FH72GGUUtqDWu3rLAjrSCkL3qwfTH2gjY0D6juLC8uZ%2F1yvsOr0NDvkIg064g7qMMHLj40lTAp8UnGFi%2FhQ%2FPIoSZkdF0SONWh4ZG7fepQM%2FZ8Kj4%2BygglxTAK%2FotIC7j2KlMNXXWkaiCoDoIULCGuMTkfdsFZcKdomWbN80TLGIYlYLb",
                  "size": 38396644,
                  "validityTime": 1200,
                  "needPay": false,
                  "payInfo": null,
                  "r": 720
              },
              "videoGroup": [
                  {
                      "id": 25135,
                      "name": "排行榜",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 25137,
                      "name": "音乐资讯",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 9104,
                      "name": "电子",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 13164,
                      "name": "快乐",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 4104,
                      "name": "电音",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 14212,
                      "name": "欧美音乐",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 5100,
                      "name": "音乐",
                      "alg": "groupTagRank"
                  }
              ],
              "previewUrl": null,
              "previewDurationms": 0,
              "hasRelatedGameAd": false,
              "markTypes": [
                  101,
                  111
              ],
              "relateSong": [],
              "relatedInfo": null,
              "videoUserLiveInfo": null,
              "vid": "683624483A2D516C7968D97115EC2542",
              "durationms": 147582,
              "playTime": 524279,
              "praisedCount": 2790,
              "praised": false,
              "subscribed": false
          }
      },
      {
          "type": 1,
          "displayed": false,
          "alg": "onlineHotGroup",
          "extAlg": null,
          "data": {
              "alg": "onlineHotGroup",
              "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
              "threadId": "R_VI_62_13A9F3DB22D6010C0177E0077A798443",
              "coverUrl": "https://p2.music.126.net/E6cOaejlE3QcGlRxzLtX6A==/109951163573440213.jpg",
              "height": 1080,
              "width": 1920,
              "title": "我从来没有轻视过任何一个会搓碟的 DJ 妹子",
              "description": "我从来没有轻视过任何一个会搓碟的 DJ 妹子。RINA 是 1988 年出生于日本仙台的一位女 DJ，从 17 岁开始接触电子音乐，属于注重技巧型的 DJ，她除了在当地俱乐部驻场之外，也参加过日本许多大大小小的派对。",
              "commentCount": 241,
              "shareCount": 368,
              "resolutions": [
                  {
                      "resolution": 240,
                      "size": 151523534
                  },
                  {
                      "resolution": 480,
                      "size": 265747334
                  },
                  {
                      "resolution": 720,
                      "size": 399218255
                  },
                  {
                      "resolution": 1080,
                      "size": 655480636
                  }
              ],
              "creator": {
                  "defaultAvatar": false,
                  "province": 450000,
                  "authStatus": 0,
                  "followed": false,
                  "avatarUrl": "http://p1.music.126.net/lVTaNtFdNVh2HhD0ORhAaA==/109951163601870551.jpg",
                  "accountStatus": 0,
                  "gender": 1,
                  "city": 450100,
                  "birthday": 692121600000,
                  "userId": 255096203,
                  "userType": 0,
                  "nickname": "John_分享",
                  "signature": "用音乐点缀怒放的生命。",
                  "description": "",
                  "detailDescription": "",
                  "avatarImgId": 109951163601870540,
                  "backgroundImgId": 109951163285208750,
                  "backgroundUrl": "http://p1.music.126.net/lpOxaFlD6ems9969KHltcg==/109951163285208749.jpg",
                  "authority": 0,
                  "mutual": false,
                  "expertTags": null,
                  "experts": {
                      "1": "音乐视频达人"
                  },
                  "djStatus": 10,
                  "vipType": 0,
                  "remarkName": null,
                  "backgroundImgIdStr": "109951163285208749",
                  "avatarImgIdStr": "109951163601870551",
                  "avatarImgId_str": "109951163601870551"
              },
              "urlInfo": {
                  "id": "13A9F3DB22D6010C0177E0077A798443",
                  "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/zLHNtzY1_1553897336_uhd.mp4?ts=1608903830&rid=3009063014E119FC636C42FBC02D0085&rl=3&rs=fRDtsNNwxiLYecYUIazCDvkyqoYvVLak&sign=dea9707189f9fea7eae4cb45147c91a1&ext=f0xw0mOJqGcf8yfMQn4khLo0vOAZ2Oret6FDS9VvANLm%2FGUb1QPWIQLEJa2U4krgnnzZ5qg4r5v8aen%2FH72GGUUtqDWu3rLAjrSCkL3qwfTH2gjY0D6juLC8uZ%2F1yvsOr0NDvkIg064g7qMMHLj40lTAp8UnGFi%2FhQ%2FPIoSZkdF0SONWh4ZG7fepQM%2FZ8Kj4%2BygglxTAK%2FotIC7j2KlMNXXWkaiCoDoIULCGuMTkfdsFZcKdomWbN80TLGIYlYLb",
                  "size": 655480636,
                  "validityTime": 1200,
                  "needPay": false,
                  "payInfo": null,
                  "r": 1080
              },
              "videoGroup": [
                  {
                      "id": 9104,
                      "name": "电子",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 4104,
                      "name": "电音",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 14212,
                      "name": "欧美音乐",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 4103,
                      "name": "演奏",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 23116,
                      "name": "音乐推荐",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 5100,
                      "name": "音乐",
                      "alg": "groupTagRank"
                  }
              ],
              "previewUrl": null,
              "previewDurationms": 0,
              "hasRelatedGameAd": false,
              "markTypes": null,
              "relateSong": [],
              "relatedInfo": null,
              "videoUserLiveInfo": null,
              "vid": "13A9F3DB22D6010C0177E0077A798443",
              "durationms": 931817,
              "playTime": 362503,
              "praisedCount": 1612,
              "praised": false,
              "subscribed": false
          }
      },
      {
          "type": 1,
          "displayed": false,
          "alg": "onlineHotGroup",
          "extAlg": null,
          "data": {
              "alg": "onlineHotGroup",
              "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
              "threadId": "R_VI_62_8AC5C69C3C4CD1D80B5D2217C82423DA",
              "coverUrl": "https://p2.music.126.net/1LjuW2BWYPoi9aTPg2gwsw==/109951164551395425.jpg",
              "height": 720,
              "width": 1280,
              "title": "泳池小姐姐火了，成了渣男统一屏保，网友：这BGM太好听了",
              "description": "泳池小姐姐火了，成了渣男统一屏保，网友：这BGM太好听了",
              "commentCount": 207,
              "shareCount": 96,
              "resolutions": [
                  {
                      "resolution": 240,
                      "size": 11699001
                  },
                  {
                      "resolution": 480,
                      "size": 19244225
                  },
                  {
                      "resolution": 720,
                      "size": 29456028
                  }
              ],
              "creator": {
                  "defaultAvatar": false,
                  "province": 440000,
                  "authStatus": 0,
                  "followed": false,
                  "avatarUrl": "http://p1.music.126.net/1FIup24CxtQQu4BAukvo9w==/109951163310275691.jpg",
                  "accountStatus": 0,
                  "gender": 0,
                  "city": 440300,
                  "birthday": 759081600000,
                  "userId": 329924712,
                  "userType": 204,
                  "nickname": "mimo音视",
                  "signature": "感谢在音乐的世界有你有我还有他",
                  "description": "",
                  "detailDescription": "",
                  "avatarImgId": 109951163310275700,
                  "backgroundImgId": 2002210674180202,
                  "backgroundUrl": "http://p1.music.126.net/pmHS4fcQtcNEGewNb5HRhg==/2002210674180202.jpg",
                  "authority": 0,
                  "mutual": false,
                  "expertTags": null,
                  "experts": {
                      "1": "音乐原创视频达人"
                  },
                  "djStatus": 0,
                  "vipType": 0,
                  "remarkName": null,
                  "backgroundImgIdStr": "2002210674180202",
                  "avatarImgIdStr": "109951163310275691",
                  "avatarImgId_str": "109951163310275691"
              },
              "urlInfo": {
                  "id": "8AC5C69C3C4CD1D80B5D2217C82423DA",
                  "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/lyT852mr_2839509310_shd.mp4?ts=1608903830&rid=3009063014E119FC636C42FBC02D0085&rl=3&rs=bXLfuSGRhQuwIrcOZFjzltuftvZLbgrr&sign=4adbb1326e46c437e487fe6b86c943d9&ext=f0xw0mOJqGcf8yfMQn4khLo0vOAZ2Oret6FDS9VvANLm%2FGUb1QPWIQLEJa2U4krgnnzZ5qg4r5v8aen%2FH72GGUUtqDWu3rLAjrSCkL3qwfTH2gjY0D6juLC8uZ%2F1yvsOr0NDvkIg064g7qMMHLj40lTAp8UnGFi%2FhQ%2FPIoSZkdF0SONWh4ZG7fepQM%2FZ8Kj4%2BygglxTAK%2FotIC7j2KlMNXXWkaiCoDoIULCGuMTkfdsFZcKdomWbN80TLGIYlYLb",
                  "size": 29456028,
                  "validityTime": 1200,
                  "needPay": false,
                  "payInfo": null,
                  "r": 720
              },
              "videoGroup": [
                  {
                      "id": 9104,
                      "name": "电子",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 4104,
                      "name": "电音",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 15241,
                      "name": "饭制",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 1105,
                      "name": "最佳饭制",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 23116,
                      "name": "音乐推荐",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 5100,
                      "name": "音乐",
                      "alg": "groupTagRank"
                  }
              ],
              "previewUrl": null,
              "previewDurationms": 0,
              "hasRelatedGameAd": false,
              "markTypes": null,
              "relateSong": [],
              "relatedInfo": null,
              "videoUserLiveInfo": null,
              "vid": "8AC5C69C3C4CD1D80B5D2217C82423DA",
              "durationms": 177216,
              "playTime": 516064,
              "praisedCount": 1536,
              "praised": false,
              "subscribed": false
          }
      },
      {
          "type": 1,
          "displayed": false,
          "alg": "onlineHotGroup",
          "extAlg": null,
          "data": {
              "alg": "onlineHotGroup",
              "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
              "threadId": "R_VI_62_8758DC50707029301436F56DE9874F86",
              "coverUrl": "https://p2.music.126.net/lf_RbebjgL9zfRDe20bJ9A==/109951163785581026.jpg",
              "height": 720,
              "width": 1280,
              "title": "All Falls Down",
              "description": "Alan Walker&Digital Farm Animals ft. Noah Cyrus - All Falls Down ",
              "commentCount": 215,
              "shareCount": 408,
              "resolutions": [
                  {
                      "resolution": 240,
                      "size": 6312019
                  },
                  {
                      "resolution": 480,
                      "size": 10725054
                  },
                  {
                      "resolution": 720,
                      "size": 14535545
                  }
              ],
              "creator": {
                  "defaultAvatar": false,
                  "province": 1000000,
                  "authStatus": 0,
                  "followed": false,
                  "avatarUrl": "http://p1.music.126.net/xMNBHISAo8cT7yI0JJnqsw==/109951165492147360.jpg",
                  "accountStatus": 0,
                  "gender": 1,
                  "city": 1010000,
                  "birthday": 874512000000,
                  "userId": 98796099,
                  "userType": 0,
                  "nickname": "云蹦迪",
                  "signature": "新浪微博：蹦迪",
                  "description": "",
                  "detailDescription": "",
                  "avatarImgId": 109951165492147360,
                  "backgroundImgId": 109951164249002480,
                  "backgroundUrl": "http://p1.music.126.net/LAlHnOSQobYb9CzDR8TpGA==/109951164249002474.jpg",
                  "authority": 0,
                  "mutual": false,
                  "expertTags": null,
                  "experts": null,
                  "djStatus": 10,
                  "vipType": 0,
                  "remarkName": null,
                  "backgroundImgIdStr": "109951164249002474",
                  "avatarImgIdStr": "109951165492147360",
                  "avatarImgId_str": "109951165492147360"
              },
              "urlInfo": {
                  "id": "8758DC50707029301436F56DE9874F86",
                  "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/j4a9D5aB_1528408355_shd.mp4?ts=1608903830&rid=3009063014E119FC636C42FBC02D0085&rl=3&rs=TyGetdLYOJeYtYlbebJmTMcZUHowleZb&sign=bb6c62eb1d8d7105b4faf002743fc464&ext=f0xw0mOJqGcf8yfMQn4khLo0vOAZ2Oret6FDS9VvANLm%2FGUb1QPWIQLEJa2U4krgnnzZ5qg4r5v8aen%2FH72GGUUtqDWu3rLAjrSCkL3qwfTH2gjY0D6juLC8uZ%2F1yvsOr0NDvkIg064g7qMMHLj40lTAp8UnGFi%2FhQ%2FPIoSZkdF0SONWh4ZG7fepQM%2FZ8Kj4%2BygglxTAK%2FotIC7j2KlMNXXWkaiCoDoIULCGuMTkfdsFZcKdomWbN80TLGIYlYLb",
                  "size": 14535545,
                  "validityTime": 1200,
                  "needPay": false,
                  "payInfo": null,
                  "r": 720
              },
              "videoGroup": [
                  {
                      "id": -32494,
                      "name": "#核爆神曲（抖腿必用）#",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 15249,
                      "name": "Alan Walker",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 9136,
                      "name": "艾兰·沃克",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 9104,
                      "name": "电子",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 13164,
                      "name": "快乐",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 4104,
                      "name": "电音",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 57106,
                      "name": "欧美现场",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 59108,
                      "name": "巡演现场",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 1100,
                      "name": "音乐现场",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 58100,
                      "name": "现场",
                      "alg": "groupTagRank"
                  },
                  {
                      "id": 5100,
                      "name": "音乐",
                      "alg": "groupTagRank"
                  }
              ],
              "previewUrl": null,
              "previewDurationms": 0,
              "hasRelatedGameAd": false,
              "markTypes": [
                  109,
                  111
              ],
              "relateSong": [
                  {
                      "name": "All Falls Down",
                      "id": 515453363,
                      "pst": 0,
                      "t": 0,
                      "ar": [
                          {
                              "id": 1045123,
                              "name": "Alan Walker",
                              "tns": [],
                              "alias": []
                          },
                          {
                              "id": 12175271,
                              "name": "Noah Cyrus",
                              "tns": [],
                              "alias": []
                          },
                          {
                              "id": 840929,
                              "name": "Digital Farm Animals",
                              "tns": [],
                              "alias": []
                          },
                          {
                              "id": 12647253,
                              "name": "Juliander",
                              "tns": [],
                              "alias": []
                          }
                      ],
                      "alia": [],
                      "pop": 100,
                      "st": 0,
                      "rt": null,
                      "fee": 8,
                      "v": 129,
                      "crbt": null,
                      "cf": "",
                      "al": {
                          "id": 36682047,
                          "name": "All Falls Down",
                          "picUrl": "http://p4.music.126.net/rTb28CZeLWxIRuSlJWkPLQ==/18850027346628137.jpg",
                          "tns": [],
                          "pic_str": "18850027346628137",
                          "pic": 18850027346628136
                      },
                      "dt": 199111,
                      "h": {
                          "br": 320000,
                          "fid": 0,
                          "size": 7967391,
                          "vd": -35300
                      },
                      "m": {
                          "br": 192000,
                          "fid": 0,
                          "size": 4780452,
                          "vd": -33000
                      },
                      "l": {
                          "br": 128000,
                          "fid": 0,
                          "size": 3186982,
                          "vd": -31500
                      },
                      "a": null,
                      "cd": "1",
                      "no": 1,
                      "rtUrl": null,
                      "ftype": 0,
                      "rtUrls": [],
                      "djId": 0,
                      "copyright": 0,
                      "s_id": 0,
                      "cp": 7001,
                      "mv": 5694021,
                      "rurl": null,
                      "mst": 9,
                      "rtype": 0,
                      "publishTime": 1509062400000,
                      "privilege": {
                          "id": 515453363,
                          "fee": 8,
                          "payed": 0,
                          "st": 0,
                          "pl": 128000,
                          "dl": 0,
                          "sp": 7,
                          "cp": 1,
                          "subp": 1,
                          "cs": false,
                          "maxbr": 999000,
                          "fl": 128000,
                          "toast": false,
                          "flag": 260,
                          "preSell": false
                      }
                  }
              ],
              "relatedInfo": null,
              "videoUserLiveInfo": null,
              "vid": "8758DC50707029301436F56DE9874F86",
              "durationms": 45924,
              "playTime": 1127560,
              "praisedCount": 6023,
              "praised": false,
              "subscribed": false
          }
      }
    ]
    let videoList = this.data.videoList
    // 将视频最新的数据更新到原有视频列表中
    videoList.push(...newVideoList)
    this.setData({
      videoList
    })
  },

  // 跳转至搜索界面
  toSearch(){
    wx.navigateTo({
      url: '/pages/search/search'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // console.log('页面的下拉刷新');
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // console.log('页面的上拉触底');
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function ({from}) {
    console.log(from);
    if(from == "button"){
      return {
        title:'来自button的转发',
        page: '/page/video/video',
        imageUrl: '/static/images/nvsheng.jpg'
      }
    }else{
      return {
        title:'来自menu的转发',
        page: '/page/video/video',
        imageUrl: '/static/images/nvsheng.jpg'
      }
    }
    
  }
})