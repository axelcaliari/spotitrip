<template>
  <div>
    <div v-for="pl in playlistsParsed" :key="pl">
      <iframe :src="getPlaylistId(pl)" width="100%" min-width="200" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
    </div>
  </div>
</template>
<script>

import VueCookies from 'vue-cookies'
import axios from "axios"
import { stringify } from 'querystring';

export default {
  data: function() {
    return{
      info: Object,
      playlistsParsed: []
    }
  },
  beforeCreate () {
    var vm = this
    axios({
        method: 'get',
        url: 'https://api.spotify.com/v1/me/playlists',
        headers: {
           'Authorization': 'Bearer ' + $cookies.get('token') 
        }
    }).then(function(response){
      
      vm.info = response.data
      for(var i = 0; i < vm.info.items.length; i++){

        vm.playlistsParsed.push(vm.info.items[i].id)
      }
    });
  },
  methods: {
    getPlaylistId(pl){
      return "https://open.spotify.com/embed/playlist/"+ pl
    }
  }
}
</script>

<style>

</style>