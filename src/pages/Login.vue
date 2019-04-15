<template>
    <div id="login">
        <h1>Use spotify to login:</h1>
        <button class="btn button is-spotify" @click="getAuth()">Login to Spotify <i class="fa fa-spotify"></i></button>
    </div>
</template>
<script>
    import VueCookies from 'vue-cookies'
    import {router} from './../router/routes'
    export default {
        data: function() {
            return{
                token: null
            }
        },
        methods: {

            login(callback) {

                const CLIENT_ID = "25981317a04c41dcae4ac5e28b956391"
                const client_secret = "4cdc8cad35eb46a19845dd1456592ce2"
                const REDIRECT_URI = "http://localhost:8080/maps"

                function getLoginURL(scopes) {
                    return 'https://accounts.spotify.com/authorize?client_id=' + CLIENT_ID +
                    '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
                    '&scope=' + encodeURIComponent(scopes.join(' ')) +
                    '&response_type=token'
                }

                var url = getLoginURL([
                    'user-read-email',
                    'playlist-modify-public',
                    'playlist-modify-private',
                    'playlist-read-private'
                ])
                
                this.$cookies.remove('token')
                
                window.location.href = url
            },
            getAuth() {

                this.login(function(accessToken) {
                    this.getUserData(accessToken)
                        .then(function(response) {
                            //console.log(response);
                            //this.display = true;
                        })
                })
            }
        } // end of methods
    }
</script>

<style scoped>
    #login {
        width: 500px;
        border: 1px solid #CCCCCC;
        background-color: #FFFFFF;
        margin: auto;
        margin-top: 200px;
        padding: 20px;
    }
</style>


