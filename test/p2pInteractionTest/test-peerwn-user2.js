describe('TestDevice2', function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 80000;
    //Init Q
    var deferred = Q.defer();
    deferred.resolve();
    var thisQ = deferred.promise;
    //Init variables
    var actorUser = undefined,
        //TODO add check for these spys
        actorUserPeer = undefined,
        sender = undefined,
        actorUser_datasender = undefined,
        actorUser_data = undefined,
        detection = "",
        clientRemoteId = "",
        clientRemoteStream = undefined,
        actorUserName = "User2",
        targetUserName = "User1",
        serverIP = 'http://10.239.44.86:8095/',
        waitInterval = 20000;
        wrongUserName = "12345";


    var videoDetection = function(videoId) {
        console.log("videoId is ", videoId);
         window.setTimeout(function() {
            console.log("setTimeout1");
            var framechecker = new VideoFrameChecker(document.getElementById(videoId));
            framechecker.checkVideoFrame_(); // start it
            window.setTimeout(function() {
                console.log("setTimeout2");
                framechecker.stop();
                if (framechecker.frameStats.numFrames > 0) {
                    console.log("framechecker frames number > 0, is : ", framechecker.frameStats.numFrames);
                    console.log("framechecker numFrozenFrames number  is : ", framechecker.frameStats.numFrozenFrames);
                    console.log("framechecker numBlackFrames number  is : ", framechecker.frameStats.numBlackFrames);
                    if (/*(framechecker.frameStats.numFrozenFrames == 0) && */(framechecker.frameStats.numBlackFrames == 0)) {
                        detection = true;
                    } else {
                        console.log("framechecker numFrozenFrames number  is : ", framechecker.frameStats.numFrozenFrames);
                        console.log("framechecker numBlackFrames number  is : ", framechecker.frameStats.numBlackFrames);
                        detection = false;
                    }
                } else {
                    console.log("framechecker frames number < = 0 , is : ", framechecker.frameStats.numFrames);
                    detection = false;
                };
            }, 1000);
        } , 3000);
    }

     var CreatePeerClientWithH264 = function(){
                config={options:{videoCodec:"h264",audioCodec:"opus"}};
                actorUser = new TestClient(actorUserName, serverIP,config);
                //bind callback listners
                actorUser.bindListener("server-disconnected", function(e) {
                    actorUser.request["server-disconnected_success"]++;
                });
                actorUser.bindListener("chat-invited", function(e) {
                    actorUser.request["chat-invited_success"]++;
                });
                actorUser.bindListener("chat-denied", function(e) {
                    actorUser.request["chat-denied_success"]++;
                });
                actorUser.bindListener("chat-started", function(e) {
                    console.log("chat-started event");
                    actorUser.request["chat-started_success"]++;
                });
                actorUser.bindListener("chat-stopped", function(e) {
                    actorUser.request["chat-stopped_success"]++;
                    sender = e.senderId;
                    actorUserPeer = e.peerId;
                });
                actorUser.bindListener("stream-added", function(e) {
                    actorUser.showInPage(e.stream);
                    clientRemoteId = e.stream.id();
                    clientRemoteStream = e.stream;
                    actorUser.request["stream-added_success"]++;
                });
                actorUser.bindListener("stream-removed", function(e) {
                    actorUser.removeVideo(e.stream);
                    actorUser.request["stream-removed_success"]++;
                });
                actorUser.bindListener("data-received", function(e) {
                    actorUser.request["data-received_success"]++;
                    actorUser_datasender = e.senderId;
                    actorUser_data = e.data;
                });
    }

    beforeEach(function(done) {
        thisQ
            .runs(function() {
                actorUser = new TestClient(actorUserName, serverIP);
                //bind callback listners
                actorUser.bindListener("server-disconnected", function(e) {
                    actorUser.request["server-disconnected_success"]++;
                });
                actorUser.bindListener("chat-invited", function(e) {
                    actorUser.request["chat-invited_success"]++;
                });
                actorUser.bindListener("chat-denied", function(e) {
                    actorUser.request["chat-denied_success"]++;
                });
                actorUser.bindListener("chat-started", function(e) {
                    actorUser.request["chat-started_success"]++;
                });
                actorUser.bindListener("chat-stopped", function(e) {
                    actorUser.request["chat-stopped_success"]++;
                    sender = e.senderId;
                    actorUserPeer = e.peerId;
                });
                actorUser.bindListener("stream-added", function(e) {
                    actorUser.showInPage(e.stream);
                    clientRemoteId = e.stream.id();
                    clientRemoteStream = e.stream;
                    actorUser.request["stream-added_success"]++;
                });
                actorUser.bindListener("stream-removed", function(e) {
                    console.log("get stream-removed event");
                    actorUser.removeVideo(e.stream);
                    actorUser.request["stream-removed_success"]++;
                });
                actorUser.bindListener("data-received", function(e) {
                    actorUser.request["data-received_success"]++;
                    actorUser_datasender = e.senderId;
                    actorUser_data = e.data;
                });
            })
            .waitsFor(function() {
                return waitLock('STARTTEST');
            },actorUserName + " wait start message", waitInterval)
            .runs(function() {
                console.log(actorUserName + ' start test!');
                done();
            });
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User2CreateLocalStream
     * 7. User1PublishToUser2
     * 8. User2PublishToUser1
     * 9. User1SendTwoMessagesToUser2
     * 10. User2SendTwoMessagesToUser1
     * 11. User1UnpublishToUser2
     * 12. User2UnpublishToUser1
     * 13. User1StopChatWithUser2
     * 14. User2InviteUser1
     * 15. User1DenyUser2
     * 16. User2Disconnect
     * 17. User1Disconnect
     */
    it('test01_TwoUserInteraction', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)


            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)



            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)
            .runs(function() {
                // action
                actorUser.createLocalStream();
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)

            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)


            .runs(function() {
                // notify lock
                var result = notifyLock('User2CreateLocalStream');
                debug("111111111111111111111111:"+result)
            })

            // 7. User1PublishToUser2
            // 8. User2PublishToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)



            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })

            // 9. User1SendTwoMessagesToUser2
            // 10. User2SendTwoMessagesToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1SendTwoMessagesToUser2');
            }, actorUserName + "wait lock: User1SendTwoMessagesToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["data-received_success"] == 1;
            }, actorUserName + "check wait: actorUser data-received", waitInterval)



            .runs(function() {
                // action
                actorUser.send(targetUserName, "english ~!#$%^&*()");
                // actorUser.send(targetUserName, "中文 ～！@＃¥％……&＊（）");
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["send_success"] == 1;
            }, actorUserName + "actoin check: send message", waitInterval)



            .runs(function() {
                // notify lock
                notifyLock('User2SendTwoMessagesToUser1');
            })
            // 11. User1UnpublishToUser2
            // 12. User2UnpublishToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1UnpublishToUser2')
            }, actorUserName + "wait lock: User1UnpublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-removed_success"] == 1;
            }, actorUserName + "check wait: stream-removed ", waitInterval)


            .runs(function() {
                // action
                actorUser.unpublish(targetUserName);
            })
            .waitsFor(function() {
                // actoin check
                return actorUser.request["unpublish_success"] == 1;
            }, actorUserName + "actoin check: unpublish ", waitInterval)


            .runs(function() {
                // notify lock
                notifyLock('User2UnpublishToUser1');
            })
            // 13. User1StopChatWithUser2
            // 14. User2InviteUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1StopChatWithUser2')
            }, actorUserName + "wait lock: User1StopChatWithUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-stopped_success"] == 1;
            }, actorUserName + " check wait: chat-stopped ", waitInterval)

            .runs(function() {
                //action
                actorUser.invited(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["invite_success"] == 1;
            }, actorUserName + " check action: invite ", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2InviteUser1')
            })
            // 15. User1DenyUser2
            // 16. User2Disconnect
            .waitsFor(function() {
                // wait lock
                return waitLock('User1DenyUser2')
            }, actorUserName + "wait lock: User1DenyUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-denied_success"] == 1;
            }, actorUserName + " check wait: chat-denied ", 6000)


            .runs(function() {
                // action
                actorUser.disconnect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["disconnect_success"] == 1;
            }, actorUserName + "check action: disconnect ", waitInterval)


            .runs(function() {
                // notify lock, then exit after a time interval
                notifyLock('User2Disconnect');
            })
            .waits('wait lock send out', 3000)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     */
    it('test02_Peer1InvitePeer2', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            
            .waits('test end',waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
            // 17. User1Disconnect
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User2InviteUser1
     */
    it('test03_Peer2InvitePeer1',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect

            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)

            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
           
            .runs(function() {
                //check wait
                //action
                actorUser.invited(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["invite_success"] == 1;
            }, actorUserName + " check action: invite ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2InviteUser1');
            })
            .waits('test end',waitInterval)
            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     */
    it('test04_Peer1InviteAndPeer2Accept', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waits('test end',waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
            // 17. User1Disconnect
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User2InviteUser1
     * 4. User1AcceptUser2
     */
    it('test05_Peer2InviteAndPeer1Accept',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
           // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)

            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .runs(function() {
                //check wait
                //action
                actorUser.invited(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["invite_success"] == 1;
            }, actorUserName + " check action: invite ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2InviteUser1')
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1AcceptUser2');
            }, actorUserName + " wait lock: User1AcceptUser2 ", waitInterval)

            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)

             .waits('test end',waitInterval)
            .runs(function() {
                console.log('test end');
                done();
            })

    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User2InviteUser1
     * 4. User1AcceptUser2
     * 5. User2InviteUser1Again
     */
   it('test06_Peer2InviteAndAcceptThenPeer2InviteAgain', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
           .runs(function() {
                //check wait
                //action
                actorUser.invited(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["invite_success"] == 1;
            }, actorUserName + " check action: invite ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2InviteUser1')
            })
            //4. User2AcceptUser1
            //5. User1CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1AcceptUser2');
            }, actorUserName + " wait lock: User1AcceptUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //invite again
            .runs(function() {
                //check wait
                //action
                actorUser.invited(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["invite_failed"] == 1;
            }, actorUserName + " check action: invite ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2InviteUser1Again')
            })
            .waits('test end',waitInterval)

            .runs(function() {
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1InviteUser2Again
     */
    it('test07_Peer1InviteAndAcceptThenPeer1InviteAgain',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)

            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
          
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            //wait for User1InviteUser2Again lock
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2Again');
            }, actorUserName + "wait lock:User1InviteUser2Again", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)

             .waits('test end',waitInterval)
            .runs(function() {
                console.log('test end');
                done();
            })
    }); 
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User2CreateLocalStream
     * 7. User1PublishToUser2
     * 8. User2PublishToUser1
     */
    it('test08_PublishEachOther', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)
            .runs(function() {
                // action
                actorUser.createLocalStream();
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)


            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)


            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })
            // 7. User1PublishToUser2
            // 8. User2PublishToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)

            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)


            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })

            .waits('test end',waitInterval)

            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User1PublishToUser2
     */
    it('test09_Peer1PublishToPeer2', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })

    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User2CreateLocalStream
     * 6. User2PublishToUser1
     */
    it('test10_Peer2PublishToPeer1', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
           
            // 5. User2CreateLocalStream
            .runs(function() {
                // action
                actorUser.createLocalStream();
            })

            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)


            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })

            //.waits("test end",2000)
            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })

            .waits("test end",10000)
             .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User2CreateLocalStream
     * 7. User1PublishToUser2
     * 8. User2PublishToUser1
     * 9. User1PublishToUser2Again
     */
    it('test11_Peer1PublishAgain', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)
            .runs(function() {
                // action
                actorUser.createLocalStream();
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)


            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)


            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })
            // 7. User1PublishToUser2
            // 8. User2PublishToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


             .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })
            
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2Again');
            }, actorUserName + "wait lock: User1PublishToUser2Again", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


            .waits('test end',waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User2CreateLocalStream
     * 7. User1PublishToUser2
     * 8. User2PublishToUser1
     * 9. User2PublishToUser1Again
     */
    it('test12_Peer2PublishAgain', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)
            .runs(function() {
                // action
                actorUser.createLocalStream();
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)


            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })
            // 7. User1PublishToUser2
            // 8. User2PublishToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)

            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


             .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })

            .waits('wait republish',3000)

            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_failed"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1Again');
            })
            .waits('test end',waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User2CreateLocalStream
     * 7. User1PublishToUser2
     * 8. User2PublishToUser1
     * 9. User1UnpublishToUser2
     * 10. User2UnpublishToUser1
     */
    it('test13_PublishUnpublishEachOther', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)
            .runs(function() {
                // action
                actorUser.createLocalStream();
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)


            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })
            // 7. User1PublishToUser2
            // 8. User2PublishToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)



            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })
            
            .waitsFor(function() {
                // wait lock
                return waitLock('User1UnpublishToUser2')
            }, actorUserName + "wait lock: User1UnpublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-removed_success"] == 1;
            }, actorUserName + "check wait: stream-removed ", waitInterval)
            .runs(function() {
                // action
                actorUser.unpublish(targetUserName);
            })
            .waitsFor(function() {
                // actoin check
                return actorUser.request["unpublish_success"] == 1;
            }, actorUserName + "actoin check: unpublish ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2UnpublishToUser1');
            })

            .waits('test end',waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
            // 17. User1Disconnect
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User2CreateLocalStream
     * 7. User1PublishToUser2
     * 8. User2PublishToUser1
     * 9. User1UnpublishToUser2
     */
    it('test14_PublishPeer1Unpublish', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)
            .runs(function() {
                // action
                actorUser.createLocalStream();
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)

            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })
            // 7. User1PublishToUser2
            // 8. User2PublishToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })
            
            .waitsFor(function() {
                // wait lock
                return waitLock('User1UnpublishToUser2')
            }, actorUserName + "wait lock: User1UnpublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-removed_success"] == 1;
            }, actorUserName + "check wait: stream-removed ", waitInterval)
           
            .waits('test end',waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
            // 17. User1Disconnect
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User2CreateLocalStream
     * 7. User1PublishToUser2
     * 8. User2PublishToUser1
     * 9. User2UnpublishToUser1
     */
    it('test15_PublishPeer2Unpublish', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
             .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })

            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)

             .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)
            .runs(function() {
                // action
                actorUser.createLocalStream();
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)


            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)


            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })
            // 7. User1PublishToUser2
            // 8. User2PublishToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)

            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })

            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)


            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })

             .waits('before unpublish',5000)

            .runs(function() {
                // action
                debug("unpublishing action");
                actorUser.unpublish(targetUserName);
            })
            .waitsFor(function() {
                // actoin check
                return actorUser.request["unpublish_success"] == 1;
            }, actorUserName + "actoin check: unpublish ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2UnpublishToUser1');
            })

            .waits('test end',waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User2CreateLocalStream
     * 7. User1PublishToUser2
     * 8. User2PublishToUser1
     * 9. User1UnpublishToUser2
     * 10. User2UnpublishToUser1
     * 11. User1PublishToUser2Again
     */
    it('test16_PublishUnpublishThenPeer1RePublish', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)
            .runs(function() {
                // action
                actorUser.createLocalStream();
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)


            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })
            // 7. User1PublishToUser2
            // 8. User2PublishToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


             .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })
           
            .waitsFor(function() {
                // wait lock
                return waitLock('User1UnpublishToUser2')
            }, actorUserName + "wait lock: User1UnpublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-removed_success"] == 1;
            }, actorUserName + "check wait: stream-removed ", waitInterval)
            .runs(function() {
                // action
                actorUser.unpublish(targetUserName);
            })
            .waitsFor(function() {
                // actoin check
                return actorUser.request["unpublish_success"] == 1;
            }, actorUserName + "actoin check: unpublish ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2UnpublishToUser1');
            })

             .waitsFor(function() {
                // wait lock
                return waitLock('User1RePublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 2;
            }, actorUserName + "check wait: stream-added", waitInterval)


            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .waits('test end',waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User2CreateLocalStream
     * 7. User1PublishToUser2
     * 8. User2PublishToUser1
     * 9. User1UnpublishToUser2
     * 10. User2UnpublishToUser1
     * 11. User2PublishToUser1Again
     */
    it('test17_PublishUnpublishThenPeer2RePublish', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })      
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
             .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)

            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)
            .runs(function() {
                // action
                actorUser.createLocalStream();
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)


            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)


            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })
            // 7. User1PublishToUser2
            // 8. User2PublishToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)



            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)



            .runs(function() {
                // action
                console.log("targetUserName is ", targetUserName);
                actorUser.publish(targetUserName);

            })
             .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })
           
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1UnpublishToUser2')
            }, actorUserName + "wait lock: User1UnpublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-removed_success"] == 1;
            }, actorUserName + "check wait: stream-removed ", waitInterval)
            .runs(function() {
                // action
                actorUser.unpublish(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2UnpublishToUser1');
            })
            .waitsFor(function() {
                // actoin check
                return actorUser.request["unpublish_success"] == 1;
            }, actorUserName + "actoin check: unpublish ", waitInterval)


             .waits('publish',5000)

            //.waits('waiting for while',6000)
            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 2;
            }, actorUserName + "actoin check: publish", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2RePublishToUser1');
            })
            
            .waits('test end',waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStreamAudioOnly
     * 6. User2CreateLocalStreamAudioOnly
     * 7. User1PublishToUser2
     * 8. User2PublishToUser1
     */
    it('test18_PublishAudioOnlyEachOther', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)
            .runs(function() {
                // action
                config = {audio: true,video: false};
                actorUser.createLocalStream(config);
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)


            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })
            // 7. User1PublishToUser2
            // 8. User2PublishToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })


            .waits('test end',waitInterval)
            .runs(function() {
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStreamAudio
     * 6. User1PublishToUser2
     */
    it('test19_Peer1PublishAudioOnly', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)

            // 7. User1PublishToUser2
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)
           
           
            .waits('test end',waitInterval)
            .runs(function() {
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User2CreateLocalStreamAudio
     * 6. User2PublishToUser1
     */
    it('test20_Peer2PublishAudioOnly', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
             .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            .runs(function() {
                // action
                config = {audio: true,video: false};
                actorUser.createLocalStream(config);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })
           
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)

            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)

           
            .waits('test end',waitInterval)
            .runs(function() {
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User1UnpublishToUser2
     */
    it('test21_Peer1UnpublishBeforePublish', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })

            .waitsFor(function() {
                // wait lock
                return waitLock('User1UnpublishToUser2');
            }, actorUserName + "wait lock:User1UnpublishToUser2", waitInterval)

             .waitsFor(function() {
                //check wait
                return actorUser.request["stream-removed_success"] == 0;
            }, actorUserName + "check wait: stream-removed ", waitInterval)

            .waits('test end',waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User2CreateLocalStream
     * 4. User2PublishToUser1
     */
    it('test22_Peer2PublishBeforeInvite', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
           
            .runs(function() {
                // action
                actorUser.createLocalStream();
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)
            
            .runs(function(){
                notifyLock('User2CreateLocalStream');
            })

            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_failed"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            }) 

            .waits('test end',waitInterval)
            .runs(function() {
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1CreateLocalStream
     * 4. User1PublishToUser2
     */
    it('test23_Peer1PublishBeforeInvite', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
           
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)
            
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 0;
            }, actorUserName + "check wait: stream-added", waitInterval)

            .waits('test end',waitInterval)
            .runs(function() {
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2CreateLocalStream
     * 3. User2PublishToUser1
     */
    it('test24_Peer2PublishBeforeLogin', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1Connect');
            }, actorUserName + " wait lock: User1Connect ", waitInterval)
           
           .runs(function() {
                // action
                actorUser.createLocalStream();
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })
            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_failed"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })

            .waits('test end',waitInterval)
            .runs(function() {
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User2Connect
     * 2. User1CreateLocalStream
     * 3. User1PublishToUser2
     */
    it('test25_Peer1PublishBeforeLogin',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            .runs(function() {
                // action
                actorUser.connect();
            })
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream", waitInterval)
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 0;
            }, actorUserName + "check wait: stream-added_success ", waitInterval)
             .waits('test end',waitInterval)
            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2CreateLocalStream
     * 5. User2PublishToUser1
     */
    it('test26_Peer2PublishBeforeAccept', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)


           .runs(function() {
                // action
                actorUser.createLocalStream();
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)



            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })

            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_failed"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)

            
            .waits('test end',waitInterval)
            .runs(function() {
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User1CreateLocalStream
     * 5. User1PublishToUser2
     */
    it('test27_Peer1PublishBeforeAccept', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
          
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)

            // 7. User1PublishToUser2
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 0;
            }, actorUserName + "check wait: stream-added", waitInterval)
           
           
            .waits('test end',waitInterval)
            .runs(function() {
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User2CreateLocalStream
     * 4. User2UnpublishToUser1
     */
    it('test28_Peer2UnpublishBeforeInvite', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })

            .runs(function() {
                // action
                actorUser.createLocalStream();
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)


              .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })

            .runs(function() {
                // action
                actorUser.unpublish(targetUserName);
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["unpublish_failed"] == 1;
            }, actorUserName + "check action: unpublish ", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2UnpublishToUser1');
            })
            
            // 17. User1Disconnect
            .waits('test end',waitInterval)
            .runs(function() {
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1CreateLocalStream
     * 4. User1UnpublishToUser2
     */
    it('test29_Peer1UnpublishBeforeInvite',function(done){
         thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })


            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User2CreateLocalStream", waitInterval)
            

            .waitsFor(function() {
                // wait lock
                return waitLock('User1UnpublishToUser2');
            }, actorUserName + "wait lock: User1UnpublishToUser2", waitInterval)

            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-removed_success"] == 0;
            }, actorUserName + "check wait: stream-removed ", waitInterval)

            .waits('test end',waitInterval)
            .runs(function() {
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User2InviteUser1
     * 4. User1DenyUser2
     */
    it('test30_Peer2InviteAndDeny',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })

             .runs(function() {
                //check wait
                //action
                actorUser.invited(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["invite_success"] == 1;
            }, actorUserName + " check action: invite ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2InviteUser1');
            })

            .waitsFor(function() {
                return waitLock('User1DenyUser2');
            }, actorUserName + "wait lock: User1DenyUser2", waitInterval)

            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 0;
            }, actorUserName + " check wait: chat-started", waitInterval)

            .waits('test end',waitInterval)
            .runs(function() {
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2DenyUser1
     */
    it('test31_Peer1InviteAndDeny', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            //5.User2DenyUser1
            .runs(function() {
                // action
                actorUser.deny(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["deny_success"] == 1;
            }, actorUserName + " check action: deny ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2DenyUser1')
            })
            
            .waits('test end',waitInterval)
            .runs(function() {
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User2InviteUser1
     * 4. User1DenyUser2
     * 5. User2CreateLocalStream
     * 6. User2PublishToUser1
     */
    it('test32_Peer2InviteAndPeer1DenyPeer2Publish', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })

            .runs(function() {
                //check wait
                //action
                actorUser.invited(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["invite_success"] == 1;
            }, actorUserName + " check action: invite ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2InviteUser1');
            })

            .waitsFor(function() {
                return waitLock('User1DenyUser2');
            }, actorUserName + "wait lock: User1DenyUser2", waitInterval)

            .runs(function() {
                // action
                actorUser.createLocalStream();
            })

            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)


            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })

           .runs(function() {
                //check wait
                // action
                //TODO change wrapper of publish
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["publish_failed"] == 1;
            }, actorUserName + "check action: publish", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })
          
            .waits('wait lock send out', 3000)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
            // 17. User1Disconnect
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2DenyUser1
     * 5. User1CreateLocalStreaM
     * 6. User1PublishToUser2
     */
    it('test33_Peer1InviteAndPeer2DenyPeer1Publish', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            
            //5.User2DenyUser1
             .runs(function() {
                // action
                actorUser.deny(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["deny_success"] == 1;
            }, actorUserName + " check action: deny ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2DenyUser1')
            })

            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 0;
            }, actorUserName + "check wait: stream-added", waitInterval)
            
            .waits('test end',waitInterval)
            .runs(function() {
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User2AcceptUser1
     */
    it('test34_Peer2AcceptBeforeInvite', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
           
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 0;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
           
            .waits('test end',waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1AcceptUser2
     */
    it('test35_Peer1AcceptBeforeInvite',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })

            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)

            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            // 2. User2Connect
            // 3. User1InviteUser2
            .waitsFor(function() {
                //wait lock
                return waitLock('User2Connect');
            }, actorUserName + " wait lock: User2Connect ", waitInterval)
            //4. User2AcceptUser1
            //5. User1CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1AcceptUser2');
            }, actorUserName + " wait lock: User1AcceptUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 0;
            }, actorUserName + " check wait: chat-started", waitInterval)
            .waits('test end',waitInterval)
            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User2AcceptUser1
     * 4. User1InviteUser2
     * 5. User2AcceptUser1
     */
    it('test36_Peer2AcceptBeforeInviteThenInviteAndAccept', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })

            //User2AcceptUser1
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 0;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1BeforeInvite')
            })

            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            
            .waits('test end',waitInterval)
            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User2Connect
     * 2. User1StopChatWithUser2
     */
    it('test37_Peer1StopBeforeConnect', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })    
           
            .waitsFor(function() {
                // wait lock
                return waitLock('User1StopChatWithUser2')
            }, actorUserName + "wait lock: User1StopChatWithUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-stopped_success"] == 0;
            }, actorUserName + " check wait: chat-stopped ", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1Connect')
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
           
            .waits('test end',waitInterval)
            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2StopChatWithUser1
     */
    it('test38_Peer2StopBeforeConnect',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            .runs(function() {
                // action
                // TODO: change wrapper function for stop()
                actorUser.stop(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["stop_failed"] == 1;
            }, actorUserName + "check action: stop ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2StopChatWithUser1');
            })         
            .waitsFor(function() {
                //wait lock
                return waitLock('User1Connect');
            }, actorUserName + " wait lock: User1Connect ", waitInterval)

            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
          
            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1StopChatWithUser2
     */
    it('test39_Peer1StopAfterAccept', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
           
            .waitsFor(function() {
                // wait lock
                return waitLock('User1StopChatWithUser2')
            }, actorUserName + "wait lock: User1StopChatWithUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-stopped_success"] == 1;
            }, actorUserName + " check wait: chat-stopped ", waitInterval)

            .waits('test end',waitInterval)
            .runs(function() {
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User2StopChatWithUser1
     */
    it('test40_Peer2StopAfterAccept',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
           .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)   
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
          
            .waits('waiting for a while',waitInterval)     
           .runs(function() {
                // action
                // TODO: change wrapper function for stop()
                actorUser.stop(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2StopChatWithUser1');
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["stop_success"] == 1;
            }, actorUserName + "check action: stop ", waitInterval)


            .waits('test end',waitInterval)
            .runs(function() {
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User2CreateLocalStream
     * 7. User1PublishToUser2
     * 8. User2PublishToUser1
     * 9. User1StopChatWithUser2
     */
    it('test41_Peer1StopAfterPublish', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)
            .runs(function() {
                // action
                actorUser.createLocalStream();
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)


              .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })
            // 7. User1PublishToUser2
            // 8. User2PublishToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })
           
            .waitsFor(function() {
                // wait lock
                return waitLock('User1StopChatWithUser2')
            }, actorUserName + "wait lock: User1StopChatWithUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-stopped_success"] == 1;
            }, actorUserName + " check wait: chat-stopped ", waitInterval)
            .runs(function() {
                //action
                actorUser.invited(targetUserName);
            })
            .waits('test end',waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User2CreateLocalStream
     * 7. User1PublishToUser2
     * 8. User2PublishToUser1
     * 9. User2StopChatWithUser1
     */
    it('test42_Peer2StopAfterPublish', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)
            .runs(function() {
                // action
                actorUser.createLocalStream();
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)


            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })
            // 7. User1PublishToUser2
            // 8. User2PublishToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)

           .waits("waiting for peer check stream-added event", 6000)
           .runs(function() {
                // action
                // TODO: change wrapper function for stop()
                actorUser.stop(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["stop_success"] == 1;
            }, actorUserName + "check action: stop ", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2StopChatWithUser1');
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["chat-stopped_success"] == 1;
            }, actorUserName + "actoin check: chat stopped", waitInterval)
            .waits('test end',waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User2CreateLocalStream
     * 7. User1PublishToUser2
     * 8. User2PublishToUser1
     * 9. User1UnpublishToUser2
     * 10. User2UnpublishToUser1
     * 11. User1StopChatWithUser2
     */
    it('test43_Peer1StopAfterUnpublish', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)
            .runs(function() {
                // action
                actorUser.createLocalStream();
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)



            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)


            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })
            // 7. User1PublishToUser2
            // 8. User2PublishToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)



            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })
          
            .waitsFor(function() {
                // wait lock
                return waitLock('User1UnpublishToUser2')
            }, actorUserName + "wait lock: User1UnpublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-removed_success"] == 1;
            }, actorUserName + "check wait: stream-removed ", waitInterval)
            .runs(function() {
                // action
                actorUser.unpublish(targetUserName);
            })
            .waitsFor(function() {
                // actoin check
                return actorUser.request["unpublish_success"] == 1;
            }, actorUserName + "actoin check: unpublish ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2UnpublishToUser1');
            })
            // 13. User1StopChatWithUser2
            // 14. User2InviteUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1StopChatWithUser2')
            }, actorUserName + "wait lock: User1StopChatWithUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-stopped_success"] == 1;
            }, actorUserName + " check wait: chat-stopped ", waitInterval)
           
            .waits('test end', waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User2CreateLocalStream
     * 7. User1PublishToUser2
     * 8. User2PublishToUser1
     * 9. User1UnpublishToUser2
     * 10. User2UnpublishToUser1
     * 11. User2StopChatWithUser1
     */
    it('test44_Peer2StopAfterUnpublish', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)

            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)
            .runs(function() {
                // action
                actorUser.createLocalStream();
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)


            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })
            // 7. User1PublishToUser2
            // 8. User2PublishToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)

             .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })
          
            .waitsFor(function() {
                // wait lock
                return waitLock('User1UnpublishToUser2')
            }, actorUserName + "wait lock: User1UnpublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-removed_success"] == 1;
            }, actorUserName + "check wait: stream-removed ", waitInterval)
            .runs(function() {
                // action
                actorUser.unpublish(targetUserName);
            })
            .waitsFor(function() {
                // actoin check
                return actorUser.request["unpublish_success"] == 1;
            }, actorUserName + "actoin check: unpublish ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2UnpublishToUser1');
            })
            .waits('running for while', 5000)
            .runs(function() {
                // action
                // TODO: change wrapper function for stop()
                actorUser.stop(targetUserName);
            })

            .waitsFor(function() {
                //check action
                return actorUser.request["stop_success"] == 1;
            }, actorUserName + "check action: stop ", waitInterval)
             .runs(function() {
                // notify lock
                notifyLock('User2StopChatWithUser1');
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-stopped_success"] == 1;
            }, actorUserName + " check wait: chat-stopped ", waitInterval)
            .waits('test end', waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1SendTwoMessagesToUser2
     * 6. User2SendTwoMessagesToUser1
     * 7. User1StopChatWithUser2
     */
    it('test45_Peer1StopAfterSend', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
          
            .waitsFor(function() {
                // wait lock
                return waitLock('User1SendTwoMessagesToUser2');
            }, actorUserName + "wait lock: User1SendTwoMessagesToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["data-received_success"] == 1;
            }, actorUserName + "check wait: actorUser data-received", waitInterval)
            .runs(function() {
                // action
                actorUser.send(targetUserName, "english ~!#$%^&*()");
                // actorUser.send(targetUserName, "中文 ～！@＃¥％……&＊（）");
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["send_success"] == 1;
            }, actorUserName + "actoin check: send message", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2SendTwoMessagesToUser1');
            })
          
            .waitsFor(function() {
                // wait lock
                return waitLock('User1StopChatWithUser2')
            }, actorUserName + "wait lock: User1StopChatWithUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-stopped_success"] == 1;
            }, actorUserName + " check wait: chat-stopped ", waitInterval)
            
            .waits('test end', waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1SendTwoMessagesToUser2
     * 6. User2SendTwoMessagesToUser1
     * 7. User2StopChatWithUser1
     */
    it('test46_Peer2StopAfterSend', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
          
            .waitsFor(function() {
                // wait lock
                return waitLock('User1SendTwoMessagesToUser2');
            }, actorUserName + "wait lock: User1SendTwoMessagesToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["data-received_success"] == 1;
            }, actorUserName + "check wait: actorUser data-received", waitInterval)
            .runs(function() {
                // action
                actorUser.send(targetUserName, "english ~!#$%^&*()");
                // actorUser.send(targetUserName, "中文 ～！@＃¥％……&＊（）");
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["send_success"] == 1;
            }, actorUserName + "actoin check: send message", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2SendTwoMessagesToUser1');
            })

            .runs(function() {
                // action
                // TODO: change wrapper function for stop()
                actorUser.stop(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["stop_success"] == 1;
            }, actorUserName + "check action: stop ", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2StopChatWithUser1');
            })
            
            .waits('test end', waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1SendTwoMessagesToUser2
     * 6. User2SendTwoMessagesToUser1
     */
    it('test47_SendEachOther', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            
            .waitsFor(function() {
                // wait lock
                return waitLock('User1SendTwoMessagesToUser2');
            }, actorUserName + "wait lock: User1SendTwoMessagesToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["data-received_success"] == 1;
            }, actorUserName + "check wait: actorUser data-received", waitInterval)
            .runs(function() {
                // action
                actorUser.send(targetUserName, "english ~!#$%^&*()");
                // actorUser.send(targetUserName, "中文 ～！@＃¥％……&＊（）");
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["send_success"] == 1;
            }, actorUserName + "actoin check: send message", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2SendTwoMessagesToUser1');
            })
           
            .waits('test end', waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });
  /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1SendTwoMessagesToUser2
     */
    it('test48_Peer1Send', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            
            .waitsFor(function() {
                // wait lock
                return waitLock('User1SendTwoMessagesToUser2');
            }, actorUserName + "wait lock: User1SendTwoMessagesToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["data-received_success"] == 1;
            }, actorUserName + "check wait: actorUser data-received", waitInterval)
           
            .waits('test end', waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });
   /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User2SendTwoMessagesToUser1
     */
    it('test49_Peer2Send', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + "check wait: chat-started", waitInterval)
            .waitsFor(function() {
                // wait lock
                return waitLock('User1SendMessagesToUser2');
            }, actorUserName + "wait lock: User1SendMessagesToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["data-received_success"] == 1;
            }, actorUserName + "check wait: actorUser data-received", waitInterval)
            .runs(function() {
                // action
                actorUser.send(targetUserName, "english ~!#$%^&*()");
                // actorUser.send(targetUserName, "中文 ～！@＃¥％……&＊（）");
            })
             .runs(function() {
                // notify lock
                notifyLock('User2SendMessagesToUser1');
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["send_success"] == 1;
            }, actorUserName + "actoin check: send message", waitInterval)

            .waits('test end', waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2SendTwoMessagesToUser1
     */
    it('test50_Peer2SendBeforeConnect', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
          
            .waitsFor(function() {
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)

            .runs(function() {
                // action
                actorUser.send(targetUserName, "english ~!#$%^&*()");
                // actorUser.send(targetUserName, "中文 ～！@＃¥％……&＊（）");
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["send_failed"] == 1;
            }, actorUserName + "actoin check: send message", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2SendTwoMessagesToUser1');
            })
          
            .waits('test end', waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User2Connect
     * 2. User1SendTwoMessagesToUser2
     */
    it('test51_Peer1SendBeforeConnect',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })

            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })

            .waitsFor(function() {
                // wait lock
                return waitLock('User2SendTwoMessagesToUser1')
            }, actorUserName + "wait lock: User2SendTwoMessagesToUser1", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["data-received_success"] == 0;
            }, actorUserName + "check wait: actorUser data-received ", waitInterval)

            .waits('test end', waitInterval)
            
            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User2CreateLocalStream
     * 7. User1PublishToUser2
     * 8. User2PublishToUser1
     * 9. User2SendTwoMessagesToUser1
     */
    it('test52_Peer2SendAfterPublish', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)
            .runs(function() {
                // action
                actorUser.createLocalStream();
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)


             .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })
            // 7. User1PublishToUser2
            // 8. User2PublishToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)

              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)

            // 9. User1SendTwoMessagesToUser2
            // 10. User2SendTwoMessagesToUser1
            .runs(function() {
                // action
                actorUser.send(targetUserName, "english ~!#$%^&*()");
                // actorUser.send(targetUserName, "中文 ～！@＃¥％……&＊（）");
            })

            .waitsFor(function() {
                //actoin check
                return actorUser.request["send_success"] == 1;
            }, actorUserName + "actoin check: send message", waitInterval)

           .runs(function() {
                // notify lock
                notifyLock('User2SendTwoMessagesToUser1');
            })

            .waits('test end', waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
            // 17. User1Disconnect
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User2CreateLocalStream
     * 7. User1PublishToUser2
     * 8. User2PublishToUser1
     * 9. User1SendTwoMessagesToUser2
     */
    it('test53_Peer1SendAfterPublish', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)
            .runs(function() {
                // action
                actorUser.createLocalStream();
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)


            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)


            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })
            // 7. User1PublishToUser2
            // 8. User2PublishToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)

              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })
            // 9. User1SendTwoMessagesToUser2
            // 10. User2SendTwoMessagesToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1SendTwoMessagesToUser2');
            }, actorUserName + "wait lock: User1SendTwoMessagesToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["data-received_success"] == 1;
            }, actorUserName + "check wait: actorUser data-received", waitInterval)
           
            .waits('test end', waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User2CreateLocalStream
     * 7. User1PublishToUser2
     * 8. User2PublishToUser1
     * 9. User1UnpublishToUser2
     * 10. User2UnpublishToUser1
     * 11. User2SendTwoMessagesToUser1
     */
    it('test54_Peer2SendAfterUnPublish', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)
            .runs(function() {
                // action
                actorUser.createLocalStream();
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)


            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })
            // 7. User1PublishToUser2
            // 8. User2PublishToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)


            .waitsFor(function() {
                // wait lock
                return waitLock('User1UnpublishToUser2')
            }, actorUserName + "wait lock: User1UnpublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-removed_success"] == 1;
            }, actorUserName + "check wait: stream-removed ", waitInterval)
            .runs(function() {
                // action
                actorUser.unpublish(targetUserName);
            })
            .waitsFor(function() {
                // actoin check
                return actorUser.request["unpublish_success"] == 1;
            }, actorUserName + "actoin check: unpublish ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2UnpublishToUser1');
            })
            .runs(function() {
                // action
                actorUser.send(targetUserName, "english ~!#$%^&*()");
                // actorUser.send(targetUserName, "中文 ～！@＃¥％……&＊（）");
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["send_success"] == 1;
            }, actorUserName + "actoin check: send message", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2SendTwoMessagesToUser1');
            })
           
            .waits('test end',waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User2CreateLocalStream
     * 7. User1PublishToUser2
     * 8. User2PublishToUser1
     * 9. User1UnpublishToUser2
     * 10. User2UnpublishToUser1
     * 11. User1SendTwoMessagesToUser2
     */
    it('test55_Peer1SendAfterUnPublish', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                   //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)

            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)
            .runs(function() {
                // action
                actorUser.createLocalStream();
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)


             .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })
            // 7. User1PublishToUser2
            // 8. User2PublishToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)

              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })

            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })
            // 9. User1SendTwoMessagesToUser2
            // 10. User2SendTwoMessagesToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1UnpublishToUser2')
            }, actorUserName + "wait lock: User1UnpublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-removed_success"] == 1;
            }, actorUserName + "check wait: stream-removed ", waitInterval)
            .runs(function() {
                // action
                actorUser.unpublish(targetUserName);
            })

            .waitsFor(function() {
                // check action
                return actorUser.request["unpublish_success"] == 1;
            }, actorUserName + "check action: unpublish ", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2UnpublishToUser1');
            })

            .waitsFor(function() {
                // wait lock
                return waitLock('User1SendTwoMessagesToUser2');
            }, actorUserName + "wait lock: User1SendTwoMessagesToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["data-received_success"] == 1;
            }, actorUserName + "check wait: actorUser data-received", waitInterval)

            .waits('test end',waitInterval)
            .runs(function() {
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1StopChatWithUser2
     * 6. User2SendTwoMessagesToUser1
     */
    it('test56_Peer2SendAfterStop', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            .waitsFor(function() {
                // wait lock
                return waitLock('User1StopChatWithUser2')
            }, actorUserName + "wait lock: User1StopChatWithUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-stopped_success"] == 1;
            }, actorUserName + " check wait: chat-stopped ", waitInterval)

           .runs(function() {
                // action
                actorUser.send(targetUserName, "english ~!#$%^&*()");
                // actorUser.send(targetUserName, "中文 ～！@＃¥％……&＊（）");
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["send_failed"] == 1;
            }, actorUserName + "actoin check: send message failure should be trigged", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2SendTwoMessagesToUser1');
            })

            .waits('test end',waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1StopChatWithUser2
     * 6. User1SendTwoMessagesToUser2
     */
    it('test57_Peer1SendAfterStop', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })            

            .waitsFor(function() {
                // wait lock
                return waitLock('User1StopChatWithUser2')
            }, actorUserName + "wait lock: User1StopChatWithUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-stopped_success"] == 1;
            }, actorUserName + " check wait: chat-stopped ", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1SendTwoMessagesToUser2');
            }, actorUserName + "wait lock: User1SendTwoMessagesToUser2", waitInterval)

            .waitsFor(function() {
                //check wait
                return actorUser.request["data-received_success"] == 0;
            }, actorUserName + "check wait: actorUser data-received", waitInterval)

            .waits('test end',waitInterval)
            .runs(function() {
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2SendTwoMessagesToUser1
     */
    it('test58_Peer2SendBeforeAccept', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)

            .runs(function() {
                // action
                actorUser.send(targetUserName, "english ~!#$%^&*()");
                // actorUser.send(targetUserName, "中文 ～！@＃¥％……&＊（）");
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["send_failed"] == 1;
            }, actorUserName + "actoin check: send message", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2SendTwoMessagesToUser1');
            })

            .waits('test end',waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
            // 17. User1Disconnect
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User1SendTwoMessagesToUser2
     */
    it('test59_Peer1SendBeforeAccept', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            
            .waitsFor(function() {
                // wait lock
                return waitLock('User1SendTwoMessagesToUser2');
            }, actorUserName + "wait lock: User1SendTwoMessagesToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["data-received_success"] == 0;
            }, actorUserName + "check wait: actorUser data-received", waitInterval)
            
            .waits('test end',waitInterval)
            .runs(function() {
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2InviteUser1
     * 5. User2DenyUser1
     * 6. User2SendTwoMessagesToUser1
     */
    it('test60_Peer2SendAfterDeny', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
           
           .runs(function() {
                // action
                actorUser.deny(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2DenyUser1');
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["deny_success"] == 1;
            }, actorUserName + " check action: deny ", waitInterval)
            .runs(function() {
                // action
                actorUser.send(targetUserName, "english ~!#$%^&*()");
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["send_failed"] == 1;
            }, actorUserName + "actoin check: send message should be failed", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2SendTwoMessagesToUser1');
            })
            .waits('test end',waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });
    /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2InviteUser1
     * 5. User2DenyUser1
     * 6. User1SendTwoMessagesToUser2
     */
    it('test61_Peer1SendAfterDeny', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
           
           .runs(function() {
                // action
                actorUser.deny(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["deny_success"] == 1;
            }, actorUserName + " check action: deny ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2DenyUser1');
            })

            .waitsFor(function() {
                // wait lock
                return waitLock('User1SendTwoMessagesToUser2');
            }, actorUserName + "wait lock: User1SendTwoMessagesToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["data-received_success"] == 0;
            }, actorUserName + "check wait: actorUser data-received", waitInterval)

            .waits('test end',waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });




 /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User1stopUser2
     * 4. User2AcceptUser1
     */
    it('test62_Peer1InviteAndStopBeforePeer2Accept', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })


            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)


            .waitsFor(function() {
                //check wait
                return waitLock('User1StopChatWithUser2');
            }, actorUserName + " wait lock :User1StopChatWithUser2", waitInterval)


            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_failed"] == 1;
            }, actorUserName + "check action: accept failed", waitInterval)
x

            .waits('test end',waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
            // 17. User1Disconnect
    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User1stopUser2
     * 4. User2AcceptUser1
     */
    it('test63_Peer1InviteAnddisconnectBeforePeer2Accept', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })


            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })


            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)



            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)


            .waitsFor(function() {
                //check wait
                return waitLock('User1disconnect');
            }, actorUserName + " wait lock :User1disconnect", waitInterval)

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_failed"] == 1;
            }, actorUserName + "check action: accept failed", waitInterval)

            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
            // 17. User1Disconnect
    });


 /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User1stopUser2
     * 4. User2denyUser1
     */
    it('test64_Peer1InviteAndStopBeforePeer2Deny', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })


            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)


            .waitsFor(function() {
                //check wait
                return waitLock('User1StopChatWithUser2');
            }, actorUserName + " wait lock :User1StopChatWithUser2", waitInterval)

              .runs(function() {
                // action
                actorUser.deny(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["deny_failed"] == 1;
            }, actorUserName + " check action: deny ", waitInterval)

            .waits('test end',waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
            // 17. User1Disconnect
    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User1stopUser2
     * 4. User2denyUser1
     */
    it('test65_Peer1InviteAnddisconnectBeforePeer2Deny', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })


            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })


            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)



            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)


            .waitsFor(function() {
                //check wait
                return waitLock('User1disconnect');
            }, actorUserName + " wait lock :User1disconnect", waitInterval)

            .runs(function() {
                // action
                actorUser.deny(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["deny_failed"] == 1;
            }, actorUserName + " check action: deny ", waitInterval)

            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
            // 17. User1Disconnect
    });



/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     */
    it('test66_Peer1InviteAndPeer2InviteAgain',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })


            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })


            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)



            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)

            .runs(function() {
                //check wait
                //action
                actorUser.invited(targetUserName);
            })

            .waitsFor(function() {
                //check action
                return actorUser.request["invite_failed"] == 1;
            }, actorUserName + " check action: invite ", waitInterval)

            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     */
    it('test67_Peer1InvitebeforePeer2Connect',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })


            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock: User1InviteUser2", waitInterval)


            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })


            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2Again');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)



            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)


            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });



/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2 accept
     * 5.  User2 accept  again
     */
    it('test68_Peer2AcceptAgain', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })


            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })


            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)



            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)



            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })

            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept success", waitInterval)

            .waitsFor(function() {
                //check action
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + "check action: chat-started_success", waitInterval)


            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_failed"] == 1;
            }, actorUserName + "check action: accept failed", waitInterval)

            .waitsFor(function() {
                //check action
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + "check action: chat-started_success", waitInterval)

            .runs(function() {
                // end test
                console.log('test end');
                done();
            })

    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2 deny
     * 5.  User2 deny  again
     */
    it('test69_Peer2DenyAgain', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })


            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })


            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)



            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)



            .runs(function() {
                // action
                actorUser.deny(targetUserName);
            })

            .waitsFor(function() {
                //check action
                return actorUser.request["deny_success"] == 1;
            }, actorUserName + "check action: deny success", waitInterval)

           .runs(function() {
                // notify lock
                notifyLock('User2Deny')
            })

            .runs(function() {
                // action
                actorUser.deny(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["deny_failed"] == 1;
            }, actorUserName + "check action: deny failed", waitInterval)

            .waits('test end',waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })

    });

/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2 deny
     * 5.  User2 accept  again
     */
    it('test70_Peer2DenythenAccept', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })


            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })


            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)



            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)



            .runs(function() {
                // action
                actorUser.deny(targetUserName);
            })

            .waitsFor(function() {
                //check action
                return actorUser.request["deny_success"] == 1;
            }, actorUserName + "check action: deny success", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2Deny')
            })

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_failed"] == 1;
            }, actorUserName + "check action: accept failed", waitInterval)



            .waits('test end',waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })

    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2 Accept
     * 5.  User2 deny  again
     */
    it('test71_Peer2AcceptthenDeny', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })


            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })


            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)



            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)



            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })

            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept success", waitInterval)


             .waitsFor(function() {
                //check action
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + "check action: chat-started_success", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })

            .runs(function() {
                // action
                actorUser.deny(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["deny_failed"] == 1;
            }, actorUserName + "check action: accept failed", waitInterval)

            .waits('test end',waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })

    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User1disconnect
     * 4. User2publishUser1
     */
    it('test72_Peer1disconnectBeforePeer2Publish', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })


            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })


            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)



            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)


            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + " check action: accept_success ", waitInterval)


             .waitsFor(function() {
                //check action
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + "check action: chat-started_success", waitInterval)


            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })

             .waitsFor(function() {
                //check wait
                return waitLock('User1disconnect');
            }, actorUserName + " wait lock :User1disconnect", waitInterval)

            .runs(function() {
                // action
                actorUser.createLocalStream();
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)

            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)


            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_failed"] == 1;
            }, actorUserName + "actoin check: publish_failed", waitInterval)




            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
            // 17. User1Disconnect
    });



/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User1disconnect
     * 4. User2publishUser1
     */
    it('test73_Peer1stopBeforePeer2Publish', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })


            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })


            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)



            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)


            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + " check action: accept_success ", waitInterval)


             .waitsFor(function() {
                //check action
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + "check action: chat-started_success", waitInterval)


            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })

             .waitsFor(function() {
                //check wait
                return waitLock('User1StopChatWithUser2');
            }, actorUserName + " wait lock :User1disconnect", waitInterval)

            .runs(function() {
                // action
                actorUser.createLocalStream();
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)

            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)


            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_failed"] == 1;
            }, actorUserName + "actoin check: publish_failed", waitInterval)




            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
            // 17. User1Disconnect
    });



/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User1disconnect
     * 4. User2publishUser1
     */
    it('test74_Peer1disconnectBeforePeer2Unpublish', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })


            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })


            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)



            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)


            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + " check action: accept_success ", waitInterval)


             .waitsFor(function() {
                //check action
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + "check action: chat-started_success", waitInterval)


            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })


            .runs(function() {
                // action
                actorUser.createLocalStream();
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)

            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)


            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish_success", waitInterval)



            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })


             .waitsFor(function() {
                //check wait
                return waitLock('User1disconnect');
            }, actorUserName + " wait lock :User1disconnect", waitInterval)



            .runs(function() {
                // action
                actorUser.unpublish(targetUserName);
            })
            .waitsFor(function() {
                // actoin check
                return actorUser.request["unpublish_failed"] == 1;
            }, actorUserName + "actoin check: unpublish_failed ", waitInterval)


            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
            // 17. User1Disconnect
    });



/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2 accept and publish
     * 4. User1 stop to user2
     * 4. User2unpublishUser1
     */
    it('test75_Peer1stopBeforePeer2Unpublish', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })


            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })


            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)



            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)


            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + " check action: accept_success ", waitInterval)


             .waitsFor(function() {
                //check action
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + "check action: chat-started_success", waitInterval)


            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })


            .runs(function() {
                // action
                actorUser.createLocalStream();
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)

            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)


            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish_success", waitInterval)



            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })


             .waitsFor(function() {
                //check wait
                return waitLock('User1StopChatWithUser2');
            }, actorUserName + " wait lock :User1disconnect", waitInterval)



            .runs(function() {
                // action
                actorUser.unpublish(targetUserName);
            })
            .waitsFor(function() {
                // actoin check
                return actorUser.request["unpublish_failed"] == 1;
            }, actorUserName + "actoin check: unpublish_failed ", waitInterval)


            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
            // 17. User1Disconnect
    });



   /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User1PublishToUser2
     */
    it('test76_Peer1PublishAndDisableVideo', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

             .runs(function() {
                // notify lock
                notifyLock('User2checkIsOk')
            })

            .waitsFor(function() {
                // wait lock
                return waitLock('User1disableVideo');
            }, actorUserName + "wait lock: User1disableVideo ", waitInterval)

            .waits('test end',2000)

            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == false;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .waits('test end',5000)

            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })

    });


 /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User1PublishToUser2
     */
    it('test77_Peer1PublishAudioOnlyAndDisableVideo', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)

             .runs(function() {
                //check wait
                // action
                //TODO change wrapper of publish
                var result = clientRemoteStream.hasVideo();
                debug(result);
                expect(result).toBeFalsy();
            })

            .waits('test end',10000)

            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })

    });




   /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User1PublishToUser2
     */
    it('test78_Peer1PublishAndDisableVideoThenEnable', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

             .runs(function() {
                // notify lock
                notifyLock('User2checkIsOk')
            })

            .waitsFor(function() {
                // wait lock
                return waitLock('User1disableVideo');
            }, actorUserName + "wait lock: User1disableVideo ", waitInterval)

            .waits('test end',2000)

            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == false;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

             .runs(function() {
                // notify lock
                notifyLock('User2checkdisableVideoIsOk');
            })


            .waitsFor(function() {
                // wait lock
                return waitLock('User1enableVideo');
            }, actorUserName + "wait lock: User1enableVideo ", waitInterval)


            .waits('test end',2000)

            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)



            .waits('test end',5000)

            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })

    });



/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User1PublishToUser2
     */
    it('test79_Peer1PublishAndDisableVideoThenDisableVideo', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

             .runs(function() {
                // notify lock
                notifyLock('User2checkIsOk')
            })

            .waitsFor(function() {
                // wait lock
                return waitLock('User1disableVideo');
            }, actorUserName + "wait lock: User1disableVideo ", waitInterval)

            .waits('test end',2000)

            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == false;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

             .runs(function() {
                // notify lock
                notifyLock('User2checkdisableVideoIsOk');
            })


            .waits('test end',5000)

            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })

    });



/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User1PublishToUser2
     * 6. User1enableVideo
     */
    it('test80_Peer1PublishAndEnableVideo', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

             .runs(function() {
                // notify lock
                notifyLock('User2checkIsOk')
            })

            .waits('test end',5000)

            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })

    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStreamAudioOnly
     * 6. User1PublishToUser2
     * 7. User1enableVideo
     */
    it('test81_Peer1PublishAudioOnlyAndEnableVideo', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)

            .waits('test end',10000)

            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })

    });


 /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User1PublishToUser2
     */
    it('test82_Peer1PublishAndPeer2disableVideo', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .runs(function() {
                //check wait
                // action
                //TODO change wrapper of publish
                var result = clientRemoteStream.disableVideo();
                expect(result).toBeTruthy();
            })


            .waits('test end',2000)

            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == false;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

            .waits('test end',5000)

            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })

    });



/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User1PublishToUser2
     */
    it('test83_Peer1PublishAudioOnlyPeer2DisableVideo', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)

            .waits('test end',2000)

            .runs(function() {
                //check wait
                // action
                //TODO change wrapper of publish
                var result = clientRemoteStream.disableVideo();
                expect(result).toBeFalsy();
            })

            .waits('test end',5000)

            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })

    });



 /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User1PublishToUser2
     */
    it('test84_Peer1PublishAndPeer2disableVideoandEnableVideo', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .runs(function() {
                //check wait
                // action
                //TODO change wrapper of publish
                var result = clientRemoteStream.disableVideo();
                expect(result).toBeTruthy();
            })


            .waits('test end',2000)

            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == false;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

            .runs(function() {
                //check wait
                // action
                //TODO change wrapper of publish
                var result = clientRemoteStream.enableVideo();
                expect(result).toBeTruthy();
            })


            .waits('test end',2000)

            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

            .waits('test end',5000)

            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })

    });

/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User1PublishToUser2
     */
    it('test85_Peer1PublishAndPeer2disableVideoandEnableVideoPeer1DisableVideo', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .runs(function() {
                //check wait
                // action
                //TODO change wrapper of publish
                var result = clientRemoteStream.disableVideo();
                expect(result).toBeTruthy();
            })


            .waits('test end',2000)

            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == false;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .runs(function() {
                // notify lock
                notifyLock('User2disableVideo')
            })


            .waitsFor(function() {
                // wait lock
                return waitLock('User1disableVideo');
            }, actorUserName + " wait lock: User1disableVideo", waitInterval)

            .waits('test end',1000)

            .runs(function() {
                //check wait
                // action
                //TODO change wrapper of publish
                var result = clientRemoteStream.enableVideo();
                expect(result).toBeTruthy();
            })


            .waits('test end',2000)

            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == false;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

            .waits('test end',5000)

            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })

    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User1PublishToUser2
     */
    it('test86_Peer1PublishVideoOnlyAndDisableAudio', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)

            .runs(function() {
                //check wait
                // action
                //TODO change wrapper of publish
                var result = clientRemoteStream.hasAudio();
                debug(result);
                expect(result).toBeFalsy();
            })

            .waits('test end',10000)

            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })

    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User1PublishToUser2
     */
    it('test87_Peer1PublishVideoOnlyPeer2DisableAudio', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


            .runs(function() {
                //check wait
                // action
                //TODO change wrapper of publish
                var result = clientRemoteStream.disableAudio();
                expect(result).toBeFalsy();
            })

            .waits('test end',5000)

            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })

    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User1PublishToUser2
     */
    it('test88_Peer1PublishVideoOnlyAndEnableAudio', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)

            .waits('test end',10000)

            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })

    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User1PublishToUser2
     */
    it('test89_Peer1PublishVideoOnlyPeer2EnableAudio', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


            .runs(function() {
                //check wait
                // action
                //TODO change wrapper of publish
                var result = clientRemoteStream.enableAudio();
                expect(result).toBeFalsy();
            })

            .waits('test end',5000)

            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })

    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User1PublishToUser2
     */
    it('test90_Peer1PublishAndCloselocalstream', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

             .runs(function() {
                // notify lock
                notifyLock('User2checkIsOk')
            })

            .waitsFor(function() {
                // wait lock
                return waitLock('User1closestream');
            }, actorUserName + "wait lock: User1closestream ", waitInterval)

            .waits('test end',2000)

            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == false;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

            .waits('test end',5000)

            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })

    });



/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User1PublishToUser2
     */
    it('test91_Peer1CloseLocalSreamBeforePublish', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)


            .waits('test end',10000)

            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })

    });




/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User1PublishToUser2
     */
    it('test92_Peer1CloseLocalSreamBeforeUnpublish', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

             .runs(function() {
                // notify lock
                notifyLock('User2checkIsOk')
            })

            .waitsFor(function() {
                // wait lock
                return waitLock('User1closestream');
            }, actorUserName + "wait lock: User1closestream ", waitInterval)

            .waits('test end',2000)

            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == false;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2checkclosestreamisok')
            })

            .waits('test end',10000)

            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })

    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User1PublishToUser2
     */
    it('test93_Peer1PublishAndCloselocalstreamthendisableVideo', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

             .runs(function() {
                // notify lock
                notifyLock('User2checkIsOk')
            })

            .waitsFor(function() {
                // wait lock
                return waitLock('User1closestream');
            }, actorUserName + "wait lock: User1closestream ", waitInterval)

            .waits('test end',2000)

            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == false;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

            .waits('test end',5000)

            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })

    });

/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User1PublishToUser2
     */
    it('test94_Peer1CloseAudioOnlylocalstreamAndPublishnewstream', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .waits('test end',5000)

            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })

    });



/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User1PublishToUser2
     */
    it('test95_Peer1CloseAudioOnlylocalstreamAndPublishnewstreamAfterUnpublish', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


            .runs(function() {
                // notify lock
                notifyLock('User2getStream');
            })

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2Again');
            }, actorUserName + "wait lock:User1PublishToUser2Again", waitInterval)

            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 2;
            }, actorUserName + "check wait: stream-added", waitInterval)

            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)




            .waits('test end',5000)

            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })

    });



/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User1PublishToUser2
     * 6. User1enableVideo
     */
    it('test96_Peer1CreateLocalStreamAnddisableVideoBeforPublishAndEnableVideo', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == false;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

             .runs(function() {
                // notify lock
                notifyLock('User2checkIsOk')
            })


            .waitsFor(function() {
                // wait lock
                return waitLock('User1enableVideo');
            }, actorUserName + "wait lock: User1enableVideo ", waitInterval)

            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })


             .waits('test end',2000)

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

            .waits('test end',5000)

            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })

    });

/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User1PublishToUser2
     * 6. User1enableVideo
     */
    it('test97_Peer1CreateLocalStreamAnddisableVideoBeforPublishAndPeer2EnableVideo', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == false;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .runs(function() {

               //videoDetection("local");
               var result = clientRemoteStream.enableVideo();
                expect(result).toBeFalsy();
            })

            .waits('test end',5000)

            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })

    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User1PublishToUser2
     * 6. User1enableVideo
     */
    it('test152_Peer1CreateLocalStreamAnddisableVideoBeforPublishAndPeer2disableVideo', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == false;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .runs(function() {

               //videoDetection("local");
               var result = clientRemoteStream.disableVideo();
                expect(result).toBeTruthy();
            })

             .runs(function() {
                // notify lock
                notifyLock('User2disableVideo')
            })

            .waitsFor(function() {
                // wait lock
                return waitLock('User1enableVideo');
            }, actorUserName + "wait lock: User1enableVideo ", waitInterval)

             .runs(function() {

               //videoDetection("local");
               var result = clientRemoteStream.enableVideo();
                expect(result).toBeTruthy();
            })


              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .waits('test end',5000)

            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })

    });



/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1SendTwoMessagesToUser2
     * 6. User2SendTwoMessagesToUser1
     * 7. User1StopChatWithUser2
     */
    it('test98_Peer1InviteAfterSend', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })

            .waitsFor(function() {
                //wait lock
                return waitLock('User1SendMessagesFailed');
            }, actorUserName + " wait lock: User1SendMessagesFailed ", waitInterval)


            .runs(function() {
                // action
                actorUser.send(targetUserName, "english ~!#$%^&*()");
                // actorUser.send(targetUserName, "中文 ～！@＃¥％……&＊（）");
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["send_failed"] == 1;
            }, actorUserName + "check action: send message failed", waitInterval)


            .runs(function() {
                //notify lock
                notifyLock('User2SendMessagesFailed');
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })

            .waitsFor(function() {
                // wait lock
                return waitLock('User1SendTwoMessagesToUser2');
            }, actorUserName + "wait lock: User1SendTwoMessagesToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["data-received_success"] == 1;
            }, actorUserName + "check wait: actorUser data-received", waitInterval)
            .runs(function() {
                // action
                actorUser.send(targetUserName, "english ~!#$%^&*()");
                // actorUser.send(targetUserName, "中文 ～！@＃¥％……&＊（）");
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["send_success"] == 1;
            }, actorUserName + "actoin check: send message", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2SendTwoMessagesToUser1');
            })

            .waitsFor(function() {
                // wait lock
                return waitLock('User1StopChatWithUser2')
            }, actorUserName + "wait lock: User1StopChatWithUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-stopped_success"] == 1;
            }, actorUserName + " check wait: chat-stopped ", waitInterval)

            .waits('test end', waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });



/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1SendTwoMessagesToUser2
     * 6. User2SendTwoMessagesToUser1
     * 7. User1StopChatWithUser2
     */
    it('test99_Peer1AcceptAfterSend', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })

            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)


             .waitsFor(function() {
                //wait lock
                return waitLock('User1SendMessagesFailed');
            }, actorUserName + " wait lock: User1SendMessagesFailed ", waitInterval)


            .runs(function() {
                // action
                actorUser.send(targetUserName, "english ~!#$%^&*()");
                // actorUser.send(targetUserName, "中文 ～！@＃¥％……&＊（）");
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["send_failed"] == 1;
            }, actorUserName + "check action: send message failed", waitInterval)


            .runs(function() {
                //notify lock
                notifyLock('User2SendMessagesFailed');
            })

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })



            .waitsFor(function() {
                // wait lock
                return waitLock('User1SendTwoMessagesToUser2');
            }, actorUserName + "wait lock: User1SendTwoMessagesToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["data-received_success"] == 1;
            }, actorUserName + "check wait: actorUser data-received", waitInterval)
            .runs(function() {
                // action
                actorUser.send(targetUserName, "english ~!#$%^&*()");
                // actorUser.send(targetUserName, "中文 ～！@＃¥％……&＊（）");
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["send_success"] == 1;
            }, actorUserName + "actoin check: send message", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2SendTwoMessagesToUser1');
            })

            .waitsFor(function() {
                // wait lock
                return waitLock('User1StopChatWithUser2')
            }, actorUserName + "wait lock: User1StopChatWithUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-stopped_success"] == 1;
            }, actorUserName + " check wait: chat-stopped ", waitInterval)

            .waits('test end', waitInterval)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });



/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1SendTwoMessagesToUser2
     * 6. User2SendTwoMessagesToUser1
     * 7. User1StopChatWithUser2
     */
    it('test100_Peer1disconnectBeforeSend', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })

            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)


            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })



            .waitsFor(function() {
                // wait lock
                return waitLock('User1SendTwoMessagesToUser2');
            }, actorUserName + "wait lock: User1SendTwoMessagesToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["data-received_success"] == 1;
            }, actorUserName + "check wait: actorUser data-received", waitInterval)
            .runs(function() {
                // action
                actorUser.send(targetUserName, "english ~!#$%^&*()");
                // actorUser.send(targetUserName, "中文 ～！@＃¥％……&＊（）");
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["send_success"] == 1;
            }, actorUserName + "actoin check: send message", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2SendTwoMessagesToUser1');
            })

            .waitsFor(function() {
                // wait lock
                return waitLock('User1Disconnect')
            }, actorUserName + "wait lock: User1Disconnect", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-stopped_success"] == 1;
            }, actorUserName + " check wait: chat-stopped ", waitInterval)



             .waitsFor(function() {
                //wait lock
                return waitLock('User1SendMessagesFailed');
            }, actorUserName + " wait lock: User1SendMessagesFailed ", waitInterval)


            .runs(function() {
                // action
                actorUser.send(targetUserName, "english ~!#$%^&*()");
                // actorUser.send(targetUserName, "中文 ～！@＃¥％……&＊（）");
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["send_failed"] == 1;
            }, actorUserName + "check action: send message failed", waitInterval)



            .waits('test end', 5000)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });



/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1SendTwoMessagesToUser2
     * 6. User2SendTwoMessagesToUser1
     * 7. User1StopChatWithUser2
     */
    it('test101_Peer1SendAfertPeer2disconnect', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })

            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)


            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })



            .waitsFor(function() {
                // wait lock
                return waitLock('User1SendTwoMessagesToUser2');
            }, actorUserName + "wait lock: User1SendTwoMessagesToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["data-received_success"] == 1;
            }, actorUserName + "check wait: actorUser data-received", waitInterval)
            .runs(function() {
                // action
                actorUser.send(targetUserName, "english ~!#$%^&*()");
                // actorUser.send(targetUserName, "中文 ～！@＃¥％……&＊（）");
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["send_success"] == 1;
            }, actorUserName + "actoin check: send message", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2SendTwoMessagesToUser1');
            })


            .runs(function() {
                // action
                // TODO: change wrapper function for stop()
                actorUser.disconnect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["disconnect_success"] == 1;
            }, actorUserName + "check action: disconnect_success ", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2Disconnect');
            })



            .waits('test end', 10000)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1SendTwoMessagesToUser2
     * 6. User2SendTwoMessagesToUser1
     * 7. User1StopChatWithUser2
     */
    it('test102_Peer1SendAfertPeer2Stop', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })

            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)


            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })



            .waitsFor(function() {
                // wait lock
                return waitLock('User1SendTwoMessagesToUser2');
            }, actorUserName + "wait lock: User1SendTwoMessagesToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["data-received_success"] == 1;
            }, actorUserName + "check wait: actorUser data-received", waitInterval)
            .runs(function() {
                // action
                actorUser.send(targetUserName, "english ~!#$%^&*()");
                // actorUser.send(targetUserName, "中文 ～！@＃¥％……&＊（）");
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["send_success"] == 1;
            }, actorUserName + "actoin check: send message", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2SendTwoMessagesToUser1');
            })


            .runs(function() {
                // action
                // TODO: change wrapper function for stop()
                actorUser.stop(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["stop_success"] == 1;
            }, actorUserName + "check action: stop_success ", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2StopChatWithUser1');
            })



            .waits('test end', 10000)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1SendTwoMessagesToUser2
     * 6. User2SendTwoMessagesToUser1
     * 7. User1StopChatWithUser2
     */
    it('test103_Peer1Sendtwice', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })

            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)


            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })



            .waitsFor(function() {
                // wait lock
                return waitLock('User1SendTwoMessagesToUser2');
            }, actorUserName + "wait lock: User1SendTwoMessagesToUser2", waitInterval)

            .waitsFor(function() {
                //check wait
                return actorUser.request["data-received_success"] == 2;
            }, actorUserName + "check wait: actorUser data-received", waitInterval)


            .runs(function() {
                // notify lock
                 expect(actorUser_data).toEqual("123456!@#$%^");
            })


            .waits('test end', 5000)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1SendTwoMessagesToUser2
     * 6. User2SendTwoMessagesToUser1
     * 7. User1StopChatWithUser2
     */
    it('test104_Peer1SendWrongid', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })

            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)


            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })



            .waits('test end', 10000)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });

 /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User1PublishToUser2
     */
    it('test105_Peer1PublishWrongId', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream

             .waits("test end",10000)

            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })

    });


  /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User2CreateLocalStream
     * 7. User1PublishToUser2
     * 8. User2PublishToUser1
     * 9. User1UnpublishToUser2
     */
    it('test106_PublishPeer1UnpublishWrongId', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })

            // 7. User1PublishToUser2
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)

            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .runs(function() {
                // notify lock
                notifyLock('User2checkIsOk');
            })

            .waitsFor(function() {
                // wait lock
                return waitLock('User1UnpublishToUser2')
            }, actorUserName + "wait lock: User1UnpublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-removed_success"] == 1;
            }, actorUserName + "check wait: stream-removed ", waitInterval)

            .waits('test end',2000)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
            // 17. User1Disconnect
    });


 /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User2StopChatWithUser1
     */
    it('test107_Peer1StopWrongId',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
           .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)

            .waitsFor(function() {
                //check wait
                return waitLock('User1StopChatWithUser2');
            }, actorUserName + " check wait: User1StopChatWithUser2", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-stopped_success"] == 1;
            }, actorUserName + "check action: stop ", waitInterval)


            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });

/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User2StopChatWithUser1
     */
    it('test108_Peer1InviteWrongId',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)


            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User2StopChatWithUser1
     */
    it('test109_Peer2AcceptWrongId',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)


            .runs(function() {
                // action
                actorUser.accept(wrongUserName);
            })

           .waitsFor(function() {
                //check action
                return actorUser.request["accept_failed"] == 1;
            }, actorUserName + "check action: accept_failed", waitInterval)

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
           .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)

            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });

/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User2StopChatWithUser1
     */
    it('test110_Peer2DenyWrongId',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)


            .runs(function() {
                // action
                actorUser.deny(wrongUserName);
            })

           .waitsFor(function() {
                //check action
                return actorUser.request["deny_failed"] == 1;
            }, actorUserName + "check action: deny_failed", waitInterval)

            .runs(function() {
                // action
                actorUser.deny(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2DenyUser1')
            })
           .waitsFor(function() {
                //check action
                return actorUser.request["deny_success"] == 1;
            }, actorUserName + "check action: deny_success", waitInterval)

            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User2StopChatWithUser1
     */
    it('test111_Peer1InviteMyselfId',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)


            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1SendTwoMessagesToUser2
     * 6. User2SendTwoMessagesToUser1
     * 7. User1StopChatWithUser2
     */
    it('test112_Peer1SendMyselfId', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })

            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)


            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })



            .waits('test end', 10000)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });

 /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User1PublishToUser2
     */
    it('test113_Peer1PublishMysefId', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


             .waits("test end",2000)

            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })

    });


  /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User2CreateLocalStream
     * 7. User1PublishToUser2
     * 8. User2PublishToUser1
     * 9. User1UnpublishToUser2
     */
    it('test114_PublishPeer1UnpublishMyselfId', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })

            // 7. User1PublishToUser2
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)

            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .runs(function() {
                // notify lock
                notifyLock('User2checkIsOk');
            })

            .waitsFor(function() {
                // wait lock
                return waitLock('User1UnpublishToUser2')
            }, actorUserName + "wait lock: User1UnpublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-removed_success"] == 1;
            }, actorUserName + "check wait: stream-removed ", waitInterval)

            .waits('test end',2000)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
            // 17. User1Disconnect
    });


 /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User2StopChatWithUser1
     */
    it('test115_Peer1StopMyslefId',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
           .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)

            .waitsFor(function() {
                //check wait
                return waitLock('User1StopChatWithUser2');
            }, actorUserName + " check wait: User1StopChatWithUser2", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-stopped_success"] == 1;
            }, actorUserName + "check action: stop ", waitInterval)


            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1SendTwoMessagesToUser2
     * 6. User2SendTwoMessagesToUser1
     * 7. User1StopChatWithUser2
     */
    it('test116_Peer1SendUndefineid', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })

            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)


            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })


            .waits('test end', 2000)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });

 /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User1PublishToUser2
     */
    it('test117_Peer1PublishUndefinedId', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)

             .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock:User1PublishToUser2", waitInterval)

            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

             .waits("test end",3000)

            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })

    });


  /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User2CreateLocalStream
     * 7. User1PublishToUser2
     * 8. User2PublishToUser1
     * 9. User1UnpublishToUser2
     */
    it('test118_PublishPeer1UnpublishUndefinedId', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })

            // 7. User1PublishToUser2
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)

            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .runs(function() {
                // notify lock
                notifyLock('User2checkIsOk');
            })

            .waitsFor(function() {
                // wait lock
                return waitLock('User1UnpublishToUser2')
            }, actorUserName + "wait lock: User1UnpublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-removed_success"] == 1;
            }, actorUserName + "check wait: stream-removed ", waitInterval)

            .waits('test end',2000)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
            // 17. User1Disconnect
    });


 /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User2StopChatWithUser1
     */
    it('test119_Peer1StopUndefinedId',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
           .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)

            .waitsFor(function() {
                //check wait
                return waitLock('User1StopChatWithUser2');
            }, actorUserName + " check wait: User1StopChatWithUser2", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-stopped_success"] == 1;
            }, actorUserName + "check action: stop ", waitInterval)


            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });

/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User2StopChatWithUser1
     */
    it('test120_Peer1InviteUndefineId',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)


            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User2StopChatWithUser1
     */
    it('test121_Peer2AcceptUndefinedId',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)


            .runs(function() {
                // action
                actorUser.accept(undefined);
            })

           .waitsFor(function() {
                //check action
                return actorUser.request["accept_failed"] == 1;
            }, actorUserName + "check action: accept_failed", waitInterval)

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
           .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)

            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });

/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User2StopChatWithUser1
     */
    it('test122_Peer2DenyUndefinedId',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)


            .runs(function() {
                // action
                actorUser.deny(undefined);
            })

           .waitsFor(function() {
                //check action
                return actorUser.request["deny_failed"] == 1;
            }, actorUserName + "check action: deny_failed", waitInterval)

            .runs(function() {
                // action
                actorUser.deny(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2DenyUser1')
            })
           .waitsFor(function() {
                //check action
                return actorUser.request["deny_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)


            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });


 /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User2StopChatWithUser1
     */
    it('test123_Peer1Stoptwice',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
           .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)

            .waitsFor(function() {
                //check wait
                return waitLock('User1StopChatWithUser2');
            }, actorUserName + " check wait: User1StopChatWithUser2", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-stopped_success"] == 1;
            }, actorUserName + "check action: stop ", waitInterval)


            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User2StopChatWithUser1
     */
    it('test124_Peer1StopAndPeer2StopUndefinedId',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
           .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)

            .waitsFor(function() {
                //check wait
                return waitLock('User1StopChatWithUser2');
            }, actorUserName + " check wait: User1StopChatWithUser2", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-stopped_success"] == 1;
            }, actorUserName + "check action: stop ", waitInterval)

             .runs(function() {
                // action
                // TODO: change wrapper function for stop()
                actorUser.stop(undefined);
            })

            .waitsFor(function() {
                //check action
                return actorUser.request["stop_failed"] == 1;
            }, actorUserName + "check action: stop_failed ", waitInterval)



            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User2StopChatWithUser1
     */
    it('test125_Peer1StopUndefinedIdbeforeAccept',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
           .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)

            .waitsFor(function() {
                //check wait
                return waitLock('User1StopChatWithUser2');
            }, actorUserName + " check wait: User1StopChatWithUser2", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-stopped_success"] == 1;
            }, actorUserName + "check action: stop ", waitInterval)


            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User2StopChatWithUser1
     */
    it('test126_Peer2checkConnectionStatusByresolution720p',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
           .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)


            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)

              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


             .runs(function() {
                // action
                var exceptvalue = {"codec_name":"VP8","frame_width":"1280","frame_height":"720","length":3};

                actorUser.getConnectionStatus(targetUserName,exceptvalue);
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["getConnectionStatus_success"] == 1;
            }, actorUserName + "check wait: getConnectionStatus_success", waitInterval)
            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User2StopChatWithUser1
     */
    it('test127_Peer2checkConnectionStatusByresolutionvga',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
           .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)


            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)

              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


             .runs(function() {
                // action
                var exceptvalue = {"codec_name":"VP8","frame_width":"640","frame_height":"480","length":3};

                actorUser.getConnectionStatus(targetUserName,exceptvalue);
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["getConnectionStatus_success"] == 1;
            }, actorUserName + "check wait: getConnectionStatus_success", waitInterval)
            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });

/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User2StopChatWithUser1
     */
    it('test128_Peer2checkConnectionStatusByresolutionsif',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
           .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)


            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)

              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


             .runs(function() {
                // action
                var exceptvalue = {"codec_name":"VP8","frame_width":"320","frame_height":"240","length":3};

                actorUser.getConnectionStatus(targetUserName,exceptvalue);
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["getConnectionStatus_success"] == 1;
            }, actorUserName + "check wait: getConnectionStatus_success", waitInterval)


            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User2StopChatWithUser1
     */
    it('test129_Peer1checkConnectionStatusByUndefinedId',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
           .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)


            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)

              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


             .runs(function() {
                // action
                //var exceptvalue = {"codec_name":"VP8","frame_width":"320","frame_height":"240","length":3};

                actorUser.getConnectionStatus(undefined,exceptvalue);
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["getConnectionStatus_failed"] == 1;
            }, actorUserName + "check wait: getConnectionStatus_failed", waitInterval)
            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });

/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User2StopChatWithUser1
     */
    it('test130_Peer1checkConnectionStatusMyselfId',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
           .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)


            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)

              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


             .runs(function() {
                // action
                //var exceptvalue = {"codec_name":"VP8","frame_width":"320","frame_height":"240","length":3};

                actorUser.getConnectionStatus(actorUserName,exceptvalue);
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["getConnectionStatus_failed"] == 1;
            }, actorUserName + "check wait: getConnectionStatus_failed", waitInterval)
            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });

/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User2StopChatWithUser1
     */
    it('test131_Peer1checkConnectionStatusWrongId',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
           .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)


            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)

              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


             .runs(function() {
                // action
                //var exceptvalue = {"codec_name":"VP8","frame_width":"320","frame_height":"240","length":3};

                actorUser.getConnectionStatus(wrongUserName,exceptvalue);
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["getConnectionStatus_failed"] == 1;
            }, actorUserName + "check wait: getConnectionStatus_failed", waitInterval)
            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User2StopChatWithUser1
     */
    it('test132_Peer1checkConnectionStatusAfterPeer1Stop',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
           .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)


            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)

              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2checkIsOk')
            })

             .waitsFor(function() {
                // wait lock
                return waitLock('User1StopChatWithUser2');
            }, actorUserName + "wait lock: User1StopChatWithUser2", waitInterval)

              .waitsFor(function() {
                //check action
                return actorUser.request["chat-stopped_success"] == 1;
            }, actorUserName + "check action: stop ", waitInterval)

             .runs(function() {
                // action
                //var exceptvalue = {"codec_name":"VP8","frame_width":"320","frame_height":"240","length":3};

                actorUser.getConnectionStatus(targetUserName,exceptvalue);
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["getConnectionStatus_failed"] == 1;
            }, actorUserName + "check wait: getConnectionStatus_failed", waitInterval)
            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });

/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User2StopChatWithUser1
     */
    it('test133_Peer1checkConnectionStatusAfterPeer1disconnect',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
           .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)


            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)

              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2checkIsOk')
            })

             .waitsFor(function() {
                // wait lock
                return waitLock('User1Disconnect');
            }, actorUserName + "wait lock: User1Disconnect", waitInterval)

              .waitsFor(function() {
                //check action
                return actorUser.request["chat-stopped_success"] == 1;
            }, actorUserName + "check action: stop ", waitInterval)

             .runs(function() {
                // action
                //var exceptvalue = {"codec_name":"VP8","frame_width":"320","frame_height":"240","length":3};

                actorUser.getConnectionStatus(targetUserName,exceptvalue);
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["getConnectionStatus_failed"] == 1;
            }, actorUserName + "check wait: getConnectionStatus_failed", waitInterval)
            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User2CreateLocalStream
     * 7. User1PublishToUser2
     * 8. User2PublishToUser1
     * 9. User2PublishToUser1Again
     */
    it('test134_Peer2PublishAndPeer2PublishThenGetconnectionstats', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)
            .runs(function() {
                // action
                config = {
                    video:{
                         device:"camera",
                         resolution:"sif",
                         frameRate: [30, 30]
                },
                audio: true
                };

                actorUser.createLocalStream(config);
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)


            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })
            // 7. User1PublishToUser2
            // 8. User2PublishToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)

            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


             .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })

            .waits('test end',5000)
            .runs(function() {
                // action
                var exceptvalue = {"codec_name":"VP8","frame_width":"640","frame_height":"480","send_codec_name":"VP8","send_frame_width":"320","send_frame_height":"240","length":5};
                actorUser.getConnectionStatus(targetUserName,exceptvalue);
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["getConnectionStatus_success"] == 1;
            }, actorUserName + "check wait: getConnectionStatus_success", waitInterval)
            .waits('test end',10000)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });

 /**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User2CreateLocalStream
     * 7. User1PublishToUser2
     * 8. User2PublishToUser1
     * 9. User1UnpublishToUser2
     * 10. User2UnpublishToUser1
     * 11. User2SendTwoMessagesToUser1
     */
    it('test135_Peer2getconnectionstatusAfterUnPublish', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)
            .runs(function() {
                // action
                config = {
                    video:{
                         device:"camera",
                         resolution:"sif",
                         frameRate: [30, 30]
                },
                audio: true
                };
                actorUser.createLocalStream(config);
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)


            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })
            // 7. User1PublishToUser2
            // 8. User2PublishToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)


            .waitsFor(function() {
                // wait lock
                return waitLock('User1UnpublishToUser2')
            }, actorUserName + "wait lock: User1UnpublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-removed_success"] == 1;
            }, actorUserName + "check wait: stream-removed ", waitInterval)
            .runs(function() {
                // action
                actorUser.unpublish(targetUserName);
            })
            .waitsFor(function() {
                // actoin check
                return actorUser.request["unpublish_success"] == 1;
            }, actorUserName + "actoin check: unpublish ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2UnpublishToUser1');
            })

            .waits('test end',3000)
            .runs(function() {
                // action
                var exceptvalue = {"codec_name":"VP8","frame_width":"640","frame_height":"480","send_codec_name":"VP8","send_frame_width":"320","send_frame_height":"240","length":5};
                actorUser.getConnectionStatus(targetUserName,exceptvalue);
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["getConnectionStatus_success"] == 1;
            }, actorUserName + "check wait: getConnectionStatus_success", waitInterval)
            .waits('test end',5000)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });

/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User2CreateLocalStream
     * 7. User1PublishToUser2
     * 8. User2PublishToUser1
     * 9. User2PublishToUser1Again
     */
    it('test136_Peer1publishhd720pAndPeer2PublishsifAndcheckgetconnectionstatus', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)
            .runs(function() {
                // action
                config = {
                    video:{
                         device:"camera",
                         resolution:"sif",
                         frameRate: [30, 30]
                },
                audio: true
                };

                actorUser.createLocalStream(config);
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)


            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })
            // 7. User1PublishToUser2
            // 8. User2PublishToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)

            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


             .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })

            .waits('test end',5000)
            .runs(function() {
                // action
                 var exceptvalue = {"codec_name":"VP8","frame_width":"1280","frame_height":"720","send_codec_name":"VP8","send_frame_width":"320","send_frame_height":"240","length":5};
                actorUser.getConnectionStatus(targetUserName,exceptvalue);
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["getConnectionStatus_success"] == 1;
            }, actorUserName + "check wait: getConnectionStatus_success", waitInterval)
            .waits('test end',10000)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User2CreateLocalStream
     * 7. User1PublishToUser2
     * 8. User2PublishToUser1
     * 9. User1UnpublishToUser2
     * 10. User2UnpublishToUser1
     * 11. User2SendTwoMessagesToUser1
     */
    it('test137_Peer1getConnectionStatusAfterPeer1CloseStream', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)
            .runs(function() {
                // action
                config = {
                    video:{
                         device:"camera",
                         resolution:"sif",
                         frameRate: [30, 30]
                },
                audio: true
                };
                actorUser.createLocalStream(config);
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)


            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })
            // 7. User1PublishToUser2
            // 8. User2PublishToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1closestream');
            }, actorUserName + "wait lock: User1closestream", waitInterval)

            .waits('test end',2000)
            .runs(function() {
                // action
                var exceptvalue = {"codec_name":"VP8","frame_width":"640","frame_height":"480","send_codec_name":"VP8","send_frame_width":"320","send_frame_height":"240","length":5};
                actorUser.getConnectionStatus(targetUserName,exceptvalue);
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["getConnectionStatus_success"] == 1;
            }, actorUserName + "check wait: getConnectionStatus_success", waitInterval)


            .waits('test end',5000)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User2CreateLocalStream
     * 7. User1PublishToUser2
     * 8. User2PublishToUser1
     * 9. User1UnpublishToUser2
     * 10. User2UnpublishToUser1
     * 11. User2SendTwoMessagesToUser1
     */
    it('test138_Peer1getConnectionStatusAfterPeer1changeResolution', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)
            .runs(function() {
                // action
                config = {
                    video:{
                         device:"camera",
                         resolution:"hd720p",
                         frameRate: [30, 30]
                },
                audio: true
                };
                actorUser.createLocalStream(config);
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)


            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })
            // 7. User1PublishToUser2
            // 8. User2PublishToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


            .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)

            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2Again');
            }, actorUserName + "wait lock: User1PublishToUser2Again", waitInterval)

            .waits('test end',2000)
            .runs(function() {
                // action
                var exceptvalue = {"codec_name":"VP8","last_frame_width":"1280","last_frame_height":"720","first_frame_width":"640","first_frame_height":"480","send_codec_name":"VP8","send_frame_width":"1280","send_frame_height":"720","length":7};
                actorUser.getConnectionStatusBylastStream(targetUserName,exceptvalue);
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["getConnectionStatus_success"] == 1;
            }, actorUserName + "check wait: getConnectionStatus_success", waitInterval)


            .waits('test end',5000)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User2AcceptUser1
     * 5. User1CreateLocalStream
     * 6. User1PublishToUser2
     */
    it('test139_Peer1PublishUndefinedStream', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream

             .waits("test end",10000)

            .runs(function() {
                // ends the case
                console.log('test end');
                done();
            })

    });

   it('test140_Peer1PublishWrongStream', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)
            .runs(function() {
                // action
                actorUser.createLocalStream();
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)


            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })
            // 7. User1PublishToUser2
            // 8. User2PublishToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)

            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


             .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })

            .waits('test end',150000)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });



it('test141_Peer1UnPublishWrongStream', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)
            .runs(function() {
                // action
                actorUser.createLocalStream();
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)


            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })
            // 7. User1PublishToUser2
            // 8. User2PublishToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)

            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


             .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })

            .waits('test end',15000)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });


it('test142_Peer1UnPublishUndefinedStream', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })
            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)
            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
            //5. User1CreateLocalStream
            // 6. User2CreateLocalStream
            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream ", waitInterval)
            .runs(function() {
                // action
                actorUser.createLocalStream();
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1
            }, actorUserName + " check action: create localStream ", waitInterval)


            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })
            // 7. User1PublishToUser2
            // 8. User2PublishToUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)

            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


             .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


            .runs(function() {
                // action
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //actoin check
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "actoin check: publish", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })

            .waits('test end',15000)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });


it('test143_Peer1SendundefinedMsg', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })

            // 3. User1InviteUser2
            //4. User2AcceptUser1
            .waitsFor(function() {
                // wait lock
                return waitLock('User1InviteUser2');
            }, actorUserName + "wait lock:User1InviteUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + " chat-invited event", waitInterval)


            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })



            .waits('test end', 10000)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });


it('test144_Peer2checkConnectionStatusByVideoOnly',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
           .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)


            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)

              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


             .runs(function() {
                // action
                var exceptvalue = {"codec_name":"VP8","frame_width":"320","frame_height":"240","length":2};

                actorUser.getConnectionStatusByVideoOnly(targetUserName,exceptvalue);
            })
           .waitsFor(function() {
                //check wait
                return actorUser.request["getConnectionStatus_success"] == 1;
            }, actorUserName + "check wait: getConnectionStatus_success", waitInterval)
            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });



it('test145_Peer2checkConnectionStatusByAudioOnly',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
           .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)


            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)

             .waits('test end',1000)
             .runs(function() {
                // action
                var exceptvalue = {"codec_name":"opus","length":2};

                actorUser.getConnectionStatusByAudioOnly(targetUserName,exceptvalue);
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["getConnectionStatus_success"] == 1;
            }, actorUserName + "check wait: getConnectionStatus_success", waitInterval)
            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });

it('test146_Peer2checkConnectionStatusByVideoOnlyEachOther',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
           .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream", waitInterval)


            .runs(function() {
                // action

                config = {
                    video:{
                         device:"camera",
                         resolution:"vga",
                         frameRate: [30, 30]
                },
                audio: false
                };
                actorUser.createLocalStream(config);
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1;
            }, actorUserName + " check action: create localStream ", waitInterval)

            .runs(function() {
                // action
                detection = "";
                videoDetection("stream"+actorUser.request["localStreamId"]);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " create localstream is fail", waitInterval)


            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)

              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)



            .runs(function() {
                //check wait
                // action
                //TODO change wrapper of publish
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "check action: publish", waitInterval)


            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })

            .waits('test end',2000)


             .runs(function() {
                // action
                var exceptvalue = {"send_codec_name":"VP8","send_frame_width":"640","send_frame_height":"480","codec_name":"VP8","frame_width":"320","frame_height":"240","length":3};
                actorUser.getConnectionStatus(targetUserName,exceptvalue);
            })
           .waitsFor(function() {
                //check wait
                return actorUser.request["getConnectionStatus_success"] == 1;
            }, actorUserName + "check wait: getConnectionStatus_success", waitInterval)
            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });



it('test147_Peer2checkConnectionStatusByAudioOnlyEachOther',function(done){
        thisQ
  .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
           .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)


            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream", waitInterval)


            .runs(function() {
                // action

                config = {
                    video:false,
                    audio: true
                };

                actorUser.createLocalStream(config);
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1;
            }, actorUserName + " check action: create localStream ", waitInterval)


            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)


            .runs(function() {
                //check wait
                // action
                //TODO change wrapper of publish
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "check action: publish", waitInterval)

            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })

             .waits('test end',1000)
             .runs(function() {
                // action
                var exceptvalue = {"send_codec_name":"opus","receive_codec_name":"opus","length":3};
                actorUser.getConnectionStatusByAudioOnly(targetUserName,exceptvalue);
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["getConnectionStatus_success"] == 1;
            }, actorUserName + "check wait: getConnectionStatus_success", waitInterval)
            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });

/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     * 3. User1InviteUser2
     * 4. User1stopUser2
     * 4. User2AcceptUser1
     */
    it('test148_Peer1ConncetAndPeer2ConnectbyPeer1Name', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connectByName(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })

            .waits('test end',8000)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
            // 17. User1Disconnect
    });

/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     */
    it('test149_Peer1ConncetAndPeer2ConnectbyPeer1NameThendisconnect', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connectByName(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })

           .runs(function() {
                // action
                actorUser.disconnect();
            })

            .waitsFor(function() {
                //check action
                return actorUser.request["disconnect_success"] == 1;
            }, actorUserName + "check action: disconnect_success", waitInterval)



            .waits('test end',10000)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
            // 17. User1Disconnect
    });

/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     */
    it('test150_Peer1ConncetTwicewillSameName', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })

            .waits('test end',8000)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
    });


/**
     * Test a normal interaction process between two users.
     * Actors: User1 and User2
     * Story:
     * 1. User1Connect
     * 2. User2Connect
     */
    it('test151_Peer1Conncetundefineid', function(done) {
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
            // 1. User1Connect
            // 2. User2Connect
            .waitsFor(function() {
                //This sentence will cause a bug in testFrameworkTest.
                // debug("wait User1Connect")
                // wait lock
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            .runs(function() {
                // check wait
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                // notify lock
                notifyLock('User2Connect')
            })

            .waits('test end',8000)
            .runs(function() {
                // end test
                console.log('test end');
                done();
            })
            // 17. User1Disconnect
    });


    it('test152_Peer2checkConnectionStatusByresolutionsifpAndCodecH264',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
                CreatePeerClientWithH264();
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
           .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)


            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)

              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


             .runs(function() {
                // action
                var exceptvalue = {"codec_name":"H264","frame_width":"320","frame_height":"240","length":3};

                actorUser.getConnectionStatus(targetUserName,exceptvalue);
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["getConnectionStatus_success"] == 1;
            }, actorUserName + "check wait: getConnectionStatus_success", waitInterval)
            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });


it('test153_Peer1setCodech264andPeer2setCodecvp8andgetconnectionstats',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
           .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)


            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)

              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


             .runs(function() {
                // action
                var exceptvalue = {"codec_name":"H264","frame_width":"320","frame_height":"240","length":3};

                actorUser.getConnectionStatus(targetUserName,exceptvalue);
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["getConnectionStatus_success"] == 1;
            }, actorUserName + "check wait: getConnectionStatus_success", waitInterval)
            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });


it('test154_Peer1setCodecVP8andPeer2setCodecH264andgetconnectionstats',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
                 CreatePeerClientWithH264();
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
           .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)


            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)

              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)


             .runs(function() {
                // action
                var exceptvalue = {"codec_name":"H264","frame_width":"640","frame_height":"480","length":3};

                actorUser.getConnectionStatus(targetUserName,exceptvalue);
            })
            .waitsFor(function() {
                //check wait
                return actorUser.request["getConnectionStatus_success"] == 1;
            }, actorUserName + "check wait: getConnectionStatus_success", waitInterval)
            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });

it('test155_Peer1VideoonlyAndPeer2audioOnlyThenPeer2checkConnectionStatusWithCodecH264',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
                CreatePeerClientWithH264();
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
           .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream", waitInterval)


            .runs(function() {
                // action

                config = {
                    video:false,
                    audio: true
                };
                actorUser.createLocalStream(config);
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1;
            }, actorUserName + " check action: create localStream ", waitInterval)


            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)

              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)



            .runs(function() {
                //check wait
                // action
                //TODO change wrapper of publish
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "check action: publish", waitInterval)


            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })

            .waits('test end',2000)


             .runs(function() {
                // action
                var exceptvalue = {"send_codec_name":"opus","length":3};
                actorUser.getConnectionStatusByAudioOnly(targetUserName,exceptvalue);
            })
           .waitsFor(function() {
                //check wait
                return actorUser.request["getConnectionStatus_success"] == 1;
            }, actorUserName + "check wait: getConnectionStatus_success", waitInterval)

            .runs(function() {
                // action
                var exceptvalue = {"codec_name":"H264","frame_width":"320","frame_height":"240","length":3};
                actorUser.getConnectionStatus(targetUserName,exceptvalue);
            })
           .waitsFor(function() {
                //check wait
                return actorUser.request["getConnectionStatus_success"] == 2;
            }, actorUserName + "check wait: getConnectionStatus_success", waitInterval)


            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });

it('test156_Peer1VideoonlyAndPeer2audioOnlyThenPeer2checkConnectionStatusWithCodecVP8',function(done){
        thisQ
            .runs(function() {
                // start test
                debug(actorUserName + "test start!");
            })
              // 2. User2Connect
            .waitsFor(function() {
                return waitLock('User1Connect');
            }, actorUserName + "wait lock: User1Connect", waitInterval)
            // .waits('wait for user2 init', 10000)
            // // 1. User1Connect
            .runs(function() {
                // action
                actorUser.connect();
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["connect_success"] == 1;
            }, actorUserName + " check action: login ", waitInterval)
            .runs(function() {
                //notify lock
                notifyLock('User2Connect');
            })
            .waitsFor(function() {
                //check action
                return waitLock('User1InviteUser2');
            }, actorUserName + " check action: User1InviteUser2 ", waitInterval)
            .waitsFor(function() {
                //check action
                return actorUser.request["chat-invited_success"] == 1;
            }, actorUserName + "check action: chat-invited", waitInterval)

            .runs(function() {
                // action
                actorUser.accept(targetUserName);
            })
            .runs(function() {
                // notify lock
                notifyLock('User2AcceptUser1')
            })
           .waitsFor(function() {
                //check action
                return actorUser.request["accept_success"] == 1;
            }, actorUserName + "check action: accept", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["chat-started_success"] == 1;
            }, actorUserName + " check wait: chat-started", waitInterval)

            .waitsFor(function() {
                // wait lock
                return waitLock('User1CreateLocalStream');
            }, actorUserName + "wait lock: User1CreateLocalStream", waitInterval)


            .runs(function() {
                // action

                config = {
                    video:false,
                    audio: true
                };
                actorUser.createLocalStream(config);
            })
            .waitsFor(function() {
                // check action
                return actorUser.request["createLocal_success"] == 1;
            }, actorUserName + " check action: create localStream ", waitInterval)


            .runs(function() {
                // notify lock
                notifyLock('User2CreateLocalStream');
            })

            .waitsFor(function() {
                // wait lock
                return waitLock('User1PublishToUser2');
            }, actorUserName + "wait lock: User1PublishToUser2", waitInterval)
            .waitsFor(function() {
                //check wait
                return actorUser.request["stream-added_success"] == 1;
            }, actorUserName + "check wait: stream-added", waitInterval)

              .runs(function() {
                // action
                detection ="";
                videoDetection("stream"+clientRemoteId);
               //videoDetection("local");
            })

            .waitsFor(function() {
                //wait lock
                return detection == true;
            }, actorUserName + " REMOTE STREAM IS GOOD", waitInterval)



            .runs(function() {
                //check wait
                // action
                //TODO change wrapper of publish
                actorUser.publish(targetUserName);
            })
            .waitsFor(function() {
                //check action
                return actorUser.request["publish_success"] == 1;
            }, actorUserName + "check action: publish", waitInterval)


            .runs(function() {
                // notify lock
                notifyLock('User2PublishToUser1');
            })

            .waits('test end',2000)


             .runs(function() {
                // action
                var exceptvalue = {"send_codec_name":"opus","length":3};
                actorUser.getConnectionStatusByAudioOnly(targetUserName,exceptvalue);
            })
           .waitsFor(function() {
                //check wait
                return actorUser.request["getConnectionStatus_success"] == 1;
            }, actorUserName + "check wait: getConnectionStatus_success", waitInterval)

            .runs(function() {
                // action
                var exceptvalue = {"codec_name":"VP8","frame_width":"1280","frame_height":"720","length":3};
                actorUser.getConnectionStatus(targetUserName,exceptvalue);
            })
           .waitsFor(function() {
                //check wait
                return actorUser.request["getConnectionStatus_success"] == 2;
            }, actorUserName + "check wait: getConnectionStatus_success", waitInterval)


            .waits('test end',5000)
            .runs(function() {
                console.log('test end');
                done();
            })
    });

});
