<template>
  <div id="flux_map">
    <l-map
      ref="basemap"
      :zoom="zoom"
      :center="center"
    >
      <l-tile-layer :url="url"></l-tile-layer>
      <!-- <l-wms-tile-layer
        :base-url="wmsUrl"
        :layers="wmsLayer.layers"
        :visible="wmsVisible"
        :styles="wmsStyles"
        :format="wmsFormat"
        :transparent="true"
      ></l-wms-tile-layer> -->
      <!-- <l-wms-tile-layer
        v-for="layer in layers"
        :key="layer.name"
        :base-url="layer.baseUrl"
        :layers="layer.layers"
        :visible="layer.visible"
        :styles="layer.style"
        :format="layer.format"
        :transparent="layer.transparent"
      ></l-wms-tile-layer>-->
    </l-map>
    <TimeBar></TimeBar>
  </div>
</template>
<script lang='ts'>
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { Getter, Mutation, State } from "vuex-class";
import "leaflet";
// import "Leaflet.TileLayer.MBTiles";
// import "leaflet-defaulticon-compatibility";
// 需要引入leaflet的样式
import "leaflet/dist/leaflet.css";
// import "leaflet";
import L, { LatLng } from "leaflet";
import echarts from "echarts";
import "echarts-gl/dist/echarts-gl";
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
  LPolyline,
  LCircle,
  LIcon,
  LWMSTileLayer
} from "vue2-leaflet";
// import {
import { WindModel } from "@/model/map/wind";
// } from "vue2-leaflet"
import { DivIcon, DivIconOptions } from "leaflet";
import { ArrayPropsDefinition } from "vue/types/options";
import TimeBar from "@/views/members/bar/TimeBar.vue";
@Component({
  components: {
    "l-marker": LMarker,
    "l-map": LMap,
    "l-tile-layer": LTileLayer,
    "l-polyline": LPolyline,
    "l-circle": LCircle,
    "l-icon": LIcon,
    "l-wms-tile-layer": LWMSTileLayer,
    TimeBar
  }
})
export default class CurrentMap extends Vue {
  mydata: any = null;
  zoom: number = 5;
  center: any = [17.6, 131.6];
  // url: string = "/mapfiles/{z}/{x}/{y}.jpg";
  // 尝试换成geoq的地图：午夜蓝色
  // url: string ="https://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetGray/MapServer/tile/{z}/{y}/{x}";
  url: string =
    // "//map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}";
    "//map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}";
  polyline: any = {
    latlngs: [],
    color: "yellow"
  };
  // 当前显示的wind layer
  windLayer: any = null;
  tempFluxDataMarker: any = null;
  color: String = "red";
  dialogTableVisible: boolean = true;
  layers: Array<any> = [];
  wmsLayer: any = {
    name: "SearchRescue:view_current_uv_abs",
    visible: true,
    format: "image/png",
    layers: "SearchRescue:view_current_uv_abs",
    style: "style_current"
  };
  defaultDateTimeStr: String = "1990-01-02T6:00:00.0Z";
  wmsBaseUrl: String = `http://localhost:8080/geoserver/SearchRescue/wms?`;
  // wmsUrl: String = `http://localhost:8082/geoserver/SearchRescue/wms?TIME=1990-01-01T6:00:00.0Z`;
  wmsFormat: String = "image/png";
  wmsStyles: String = "my_wind_dir_barbs_new";
  wmsVisible: boolean = true;
  // current: String = this.current;
  // 初始化底图，加载数据
  initMap(): void {
    // 尝试在此处对layer 数组进行初始化
    this.layers.push(
      new WindModel(
        "",
        "",
        "SearchRescue:view_my_wind_barbs_new",
        true,
        "my_wind_dir_barbs_new",
        "image/png",
        true
      )
    );
  }

  // 向当前layer中加入新的wind layer
  insertWindLayer(currentStr: String): void {
    var myself = this;
    var basemap: any = this.$refs.basemap;
    var mymap: any = basemap["mapObject"];
    var current: String = currentStr;
    // 每次插入新的layer时，需要先清除之前的layer
    this.clearWindLayer();
    if (currentStr === "") {
      current = myself.defaultDateTimeStr;
    } else {
      current = currentStr;
    }

    var wmsLayer = L.tileLayer.wms(`${myself.wmsBaseUrl}TIME=${current}`, {
      layers: myself.wmsLayer.name,
      styles: myself.wmsLayer.style,
      format: myself.wmsLayer.format,
      transparent: true
    });
    this.windLayer = wmsLayer;

    var fluxDivIconTarget = wmsLayer.addTo(mymap);

    this.tempFluxDataMarker = fluxDivIconTarget;
  }
  // 将传入的layer从map中删除
  removeLayerFromMap(tempLay: any): void {}
  initTestSearchData(val: String): void {
    var myself = this;
    // var mymap:any= this.$refs.basemap["mapObject"];
    // type mapType = "Vue" | "Element" | "Vue[]" | "Element[]";
    // TODO:[-] 19-08-17 :注意此处 若使用this.$refs.basemap["mapObject"] 会提示类型错误，只能使用如下的方式
    var basemap: any = this.$refs.basemap;
    var mymap: any = basemap["mapObject"];
    var current: String = val;
    this.clearWindLayer();
    if (val === "") {
      current = "2016-07-20T12:00:00.0Z";
    } else {
      current = val;
    }
    var wmsLayer = L.tileLayer.wms(
      `http://localhost:8080/geoserver/SearchRescue/wms?TIME=${current}`,
      // `http://localhost:8080/geoserver/SearchRescue/wms`,
      {
        layers: "SearchRescue:view_current_uv_abs",
        styles: "style_current",
        format: "image/png",
        transparent: true
      }
    );
    this.windLayer = wmsLayer;
    var fluxDivIconTarget = wmsLayer.addTo(mymap);

    this.tempFluxDataMarker = fluxDivIconTarget;
  }

  //清除wind layer
  clearWindLayer(): void {
    var basemap: any = this.$refs.basemap;
    var mymap: any = basemap["mapObject"];
    // 若当前的wind layer已选中，则从map中删除
    if (this.windLayer != null) {
      mymap.removeLayer(this.windLayer);
    }
  }
  opened(): void {
    // console.log("加载完毕");
  }

  showUavModal(): void {}
  clearFluxMarker(temp: any): void {
    var myself = this;
    var basemap: any = this.$refs.basemap;
    var mymap: any = basemap["mapObject"];
    mymap.removeLayer(myself.tempFluxDataMarker);
    myself.tempFluxDataMarker = null;
  }
  // showTestData(temp: FluxData): void {}
  createMarker(): void {}

  mounted() {
    // this.initTestSearchData("");
  }

  @Watch("dialogTableVisible")
  onVisible(val: boolean) {}

  get computedTest() {
    return null;
  }

  @Watch("current")
  onCurrent(val: String) {
    // this.wmsUrl='';
    // console.log(`current:${val}`);
    // TODO:[-] 注意在ts中对于String类型，不能直接通过+进行拼接，
    var myself = this;
    var defaultCurrent = "2016-07-20T12:00:00.0Z";
    // this.current = defaultCurrent;
    var finialUrl = "";
    // var currentTemp=this.current;
    if (myself.current == "") {
      finialUrl = this.wmsBaseUrl.concat(`TIME=${defaultCurrent}`);
      // return this.wmsBaseUrl;
    } else {
      finialUrl = this.wmsBaseUrl.concat(`TIME=${myself.current}`);
    }
    this.layers = [];

    this.insertWindLayer(val);
    // this.clearWmsLayer();
    this.$nextTick(() => {
      // this.$refs.basemap.mapObject.ANY_LEAFLET_MAP_METHOD();
    });

    return finialUrl;
  }

  get current(): String {
    return this.$store.state.current;
  }

  // @Watch("wmsUrl")
  // 此处不再需要计算wmsUrl了
  get wmsUrl(): String {
    // TODO:[-] 注意在ts中对于String类型，不能直接通过+进行拼接，
    var myself = this;
    var defaultCurrent = "1990-01-02T6:00:00.0Z";
    var finialUrl = "";
    // var currentTemp=this.current;
    if (myself.current == "") {
      finialUrl = this.wmsBaseUrl.concat(`TIME=${defaultCurrent}`);
      // return this.wmsBaseUrl;
    } else {
      finialUrl = this.wmsBaseUrl.concat(`TIME=${myself.current}`);
    }
    this.layers = [];
    // this.layers.push(
    //   new WindModel(
    //     "",
    //     finialUrl,
    //     "SearchRescue:view_my_wind_barbs_new",
    //     true,
    //     "my_wind_dir_barbs_new",
    //     "image/png",
    //     true
    //   )
    // );
    this.initTestSearchData(defaultCurrent);
    // this.clearWmsLayer();
    return finialUrl;
  }
}
</script>
<style>
#flux_map {
  /* height: 100%; */
  /* display: flex;
  flex-direction: column; */
  width: 1500px;
  height: 700px;
  background: #ff0808;
}
.flux_icon_default {
  width: 750px !important;
  color: black;
  background: #eeff00;
}

#flux_data_div {
}
#main {
  height: 600px;
  width: 800px;
}
</style>