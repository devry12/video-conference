const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const mypeer = new Peer({
    host: 'peer-js-test-devry.herokuapp.com',
    path: '/peerjs/myapp',
    secure: true,
    debug: 3,
    config: {
        'iceServers': [
            { url: 'stun:stun.l.google.com:19302' },
            { url: 'video.devrykawiryan.id', credential: 'devry-server' }
        ]
    }
})



const myVideo = document.createElement('video')
myVideo.muted = true
myVideo.classList.add('card')

const peers = {}
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,

}).then((
    stream => {
        addVideoStream(myVideo, stream)
        mypeer.on('call', call => {
            call.answer(stream)
            const video = document.createElement('video');
            video.classList.add('card')
            video.classList.add('ml-4')
            call.on('stream', userVideoStream => {
                addVideoStream(video, userVideoStream)
            })
        })

        socket.on('user-connected', userId => {
            connectToNewUser(userId, stream)
        })



    }
))
socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})
mypeer.on('open', id => {
    alert(id)
    socket.emit('join-room', ROOM_ID, id)

})

function addVideoStream(video, stream) {
    video.srcObject = stream

    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

function connectToNewUser(userId, stream) {
    const call = mypeer.call(userId, stream);
    const video = document.createElement('video')
    video.classList.add('card')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}
