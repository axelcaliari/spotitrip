<template>
  <div>
    <card class="card-map" title="OpenStreet Maps">
      <div class="map">
        <div id="map"></div>
      </div>
    </card>
    <h3>Make Your Playlist</h3>
    <form>
      <input class='input-maps' type='text' name='departure' placeholder='Departure City' v-model='cities.departure'/>
      <input class='input-maps' type="text" name="arrival" placeholder='Arrival City' v-model='cities.arrival'/>
      <button class='btn' type="button" v-on:click="generatePlaylist">Generate your playlist</button>
    </form>
  </div>
</template>
<script>
// import
import { OpenStreetMapProvider, } from 'leaflet-geosearch';
import file from '@/assets/txt/loc.txt'
import VueCookies from 'vue-cookies'

export default {
  data() {
    return {
      cities: {
        departure: '',
        arrival: ''
      } ,
      mymap: null,
      routeControl: null,
      IDlist: file.split("\n"),
      artists_id: [],
      playlist_id: '',
      tracks_uri: '',
      token: $cookies.get('token')
    }
  },
  methods: {
    addTracks () {
      let url_addTracks = 'https://api.spotify.com/v1/playlists/' + this.playlist_id + '/tracks?uris=' + this.tracks_uri

      let xhr = new XMLHttpRequest()
      xhr.open('POST', url_addTracks)
      xhr.setRequestHeader('Authorization', 'Bearer ' + $cookies.get('token'))
      xhr.setRequestHeader('Content-type', 'application/json')

      xhr.onreadystatechange = (e) => {
        if(xhr.readyState === 4 && xhr.status === 201){
        }
      }
      xhr.send()
    },
    getTracks () {
      let artists_length = this.artists_id.length
      for(var i = 0; i < artists_length ; i++){
        let url_getTracks = 'https://api.spotify.com/v1/artists/' + this.artists_id[i][0] + '/top-tracks?country=' + this.artists_id[i][1]

        let xhr = new XMLHttpRequest()
        xhr.open('GET', url_getTracks)
        xhr.setRequestHeader('Authorization', 'Bearer ' + $cookies.get('token'))

        xhr.onreadystatechange = (e) => {
          if(xhr.readyState === 4 && xhr.status === 200){
            let response = JSON.parse(xhr.responseText)
            let tracks = response['tracks']
            let tracks_length = tracks.length

            for(let i = 0; i < tracks_length; i++){
              this.tracks_uri += tracks[i]['uri'] + ','
            }
            this.addTracks()
          }
        }
        xhr.send(null)
      }
    },
    createPlaylist () {
      const url_createPlaylist = 'https://api.spotify.com/v1/me/playlists'
      
      var xhr = new XMLHttpRequest()
      xhr.open('POST', url_createPlaylist)
      xhr.setRequestHeader('Accept', 'application/json')
      xhr.setRequestHeader('Content-type', 'application/json')
      xhr.setRequestHeader('Authorization', 'Bearer ' + $cookies.get('token'))

      xhr.onreadystatechange = (e) => {
        if(xhr.readyState === 4 && xhr.status === 201){
          this.playlist_id = JSON.parse(xhr.responseText)['id']
          this.getTracks()
        }
      }
      xhr.send('{"name": "Spotitrip Playlist","description": "Here is a playlist made for your roadtrip","public": false}')
    },
    getArtists () {
      let regexpDeparture = RegExp(this.cities.departure + ',')
      let regexpArrival = RegExp(this.cities.arrival + ',')
      let ID_length = this.IDlist.length
      let counterDeparture = 0, counterArrival = 0

      for(var i = 0; i < ID_length || (counterDeparture < 5 && counterArrival < 5); i++) {
        if(regexpDeparture.test(this.IDlist[i]) && counterDeparture < 5){
          counterDeparture+=1
          let line = this.IDlist[i].split(' ')

          var url_search = ''
          if(line[3] !== '<sep>')
            url_search = 'https://api.spotify.com/v1/search?q=' + line[2] + '%20' + line[3] + '&type=artist'
          else
            url_search = 'https://api.spotify.com/v1/search?q=' + line[2] + '&type=artist'
    
          let xhr = new XMLHttpRequest()
          xhr.open('GET', url_search)
          xhr.setRequestHeader('Authorization', 'Bearer ' + $cookies.get('token'))

          xhr.onreadystatechange = (e) => {
            if(xhr.readyState === 4 && xhr.status === 200){
              this.artists_id.push([JSON.parse(xhr.responseText)['artists']['items'][0]['id'], line[line.length-1]])
            }
          }
          xhr.send(null)
        }
        else if(regexpArrival.test(this.IDlist[i]) && counterArrival < 5){
          counterArrival+=1
          let line = this.IDlist[i].split(' ')

          var url_search = ''
          if(line[3] !== '<sep>')
            url_search = 'https://api.spotify.com/v1/search?q=' + line[2] + '%20' + line[3] + '&type=artist'
          else
            url_search = 'https://api.spotify.com/v1/search?q=' + line[2] + '&type=artist'
    
          let xhr = new XMLHttpRequest()
          xhr.open('GET', url_search)
          xhr.setRequestHeader('Authorization', 'Bearer ' + $cookies.get('token'))

          xhr.onreadystatechange = (e) => {
            if(xhr.readyState === 4 && xhr.status === 200){
              this.artists_id.push([JSON.parse(xhr.responseText)['artists']['items'][0]['id'], line[line.length-1]])
            }
          }
          xhr.send(null)
        }
      }
    },
    async generatePlaylist () {
      const provider = new OpenStreetMapProvider()

      if(this.routeControl !== null)
        this.mymap.removeControl(this.routeControl)

      let latDepart, lonDepart, latArriv, lonArriv
      provider.search({ query: this.cities.departure }).then((results) => {
        latDepart = results[0]['y']
        lonDepart = results[0]['x']
      }).then(() =>
      provider.search({ query: this.cities.arrival }).then((results) => {
        latArriv = results[0]['y']
        lonArriv = results[0]['x']
      })).then(() =>
      this.routeControl = L.Routing.control({
        waypoints: [L.latLng(latDepart, lonDepart), L.latLng(latArriv, lonArriv)],
        routeWhileDragging: true
      }).addTo(this.mymap)
      ).then(() => this.getArtists()
      ).then(() => this.createPlaylist()
      )
    },
    setToken() {
      const params = this.$route.hash.split('&').map(part => part.replace(/#/, ''))
      const parts = params[0].split('=')
      this.$cookies.set('token', parts[1])
      this.$router.push('maps') 
    }
  },
  mounted() {
      // Create mymap
      this.mymap = L.map("map").setView([48.852969, 2.349903], 11)
      // Associates Leaflet to OpenStreetMaps
      L.tileLayer("https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {
        attribution:
          'données © <a href="//osm.org/copyright">OpenStreetMap</a>/ODbL - rendu <a href="//openstreetmap.fr">OSM France</a>',
        minZoom: 1,
        maxZoom: 20
      }).addTo(this.mymap)
      if(!this.$cookies.isKey('token')) this.setToken()
    }
  }
</script>
<style>
  #map {
    /* Map height has to be set */
    height: 400px;
  }
  .input-maps {
    display: block;
    padding: 5px;
    margin: 5px;
  }
</style>
