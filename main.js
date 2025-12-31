// 主应用逻辑
let solarSystem = null;

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('canvas-container');
    const loading = document.getElementById('loading');
    
    // 显示加载提示
    loading.classList.add('show');
    
    // 初始化太阳系
    setTimeout(() => {
        solarSystem = new SolarSystem(container);
        loading.classList.remove('show');
        setupEventListeners();
    }, 100);
});

function setupEventListeners() {
    // 时间速度控制
    const timeSpeedSlider = document.getElementById('time-speed');
    const timeSpeedValue = document.getElementById('time-speed-value');
    
    timeSpeedSlider.addEventListener('input', (e) => {
        const speed = parseFloat(e.target.value);
        timeSpeedValue.textContent = speed.toFixed(1) + 'x';
        solarSystem.setTimeSpeed(speed);
    });
    
    // 暂停按钮
    const pauseBtn = document.getElementById('pause-btn');
    pauseBtn.addEventListener('click', () => {
        solarSystem.pause();
        pauseBtn.textContent = solarSystem.isPaused ? '继续' : '暂停';
    });
    
    // 重置按钮
    const resetBtn = document.getElementById('reset-btn');
    resetBtn.addEventListener('click', () => {
        solarSystem.reset();
    });
    
    // 复位镜头按钮
    const resetCameraBtn = document.getElementById('reset-camera-btn');
    resetCameraBtn.addEventListener('click', () => {
        solarSystem.resetCamera();
    });
    
    // 显示轨道
    const showOrbits = document.getElementById('show-orbits');
    showOrbits.addEventListener('change', (e) => {
        solarSystem.toggleOrbits(e.target.checked);
    });
    
    // 显示标签
    const showLabels = document.getElementById('show-labels');
    showLabels.addEventListener('change', (e) => {
        solarSystem.toggleLabels(e.target.checked);
    });
    
    // 行星选择器
    const planetButtons = document.querySelectorAll('.planet-btn');
    planetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const planetName = btn.getAttribute('data-planet');
            solarSystem.focusPlanet(planetName);
            showPlanetInfo(planetName);
        });
    });
    
    // 点击行星显示信息
    setupPlanetClickDetection();
    
    // 按ESC键取消聚焦
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && solarSystem.focusedPlanet) {
            solarSystem.unfocusPlanet();
        }
    });
}

function setupPlanetClickDetection() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    function onMouseClick(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, solarSystem.camera);
        
        const intersects = raycaster.intersectObjects(
            Object.values(solarSystem.planets),
            true
        );
        
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            let planetName = null;
            
            // 查找行星名称
            if (clickedObject.userData.name) {
                planetName = clickedObject.userData.name;
            } else {
                // 如果是子对象（如月球），向上查找父对象
                let parent = clickedObject.parent;
                while (parent) {
                    if (parent.userData && parent.userData.name) {
                        planetName = parent.userData.name;
                        break;
                    }
                    parent = parent.parent;
                }
            }
            
            if (planetName && planetName !== 'moon') {
                showPlanetInfo(planetName);
                solarSystem.focusPlanet(planetName);
            } else if (intersects.length === 0 && solarSystem.focusedPlanet) {
                // 点击空白区域，取消聚焦
                solarSystem.unfocusPlanet();
            }
        } else if (solarSystem.focusedPlanet) {
            // 点击空白区域，取消聚焦
            solarSystem.unfocusPlanet();
        }
    }
    
    window.addEventListener('click', onMouseClick);
}

function showPlanetInfo(planetName) {
    const infoTitle = document.getElementById('info-title');
    const infoContent = document.getElementById('info-content');
    
    const planet = solarSystem.getPlanetByName(planetName);
    if (!planet) return;
    
    const data = solarSystem.planetData[planetName];
    const info = data.info;
    
    infoTitle.textContent = data.name;
    
    let html = '';
    Object.keys(info).forEach(key => {
        const label = getInfoLabel(key);
        html += `<p><strong>${label}：</strong>${info[key]}</p>`;
    });
    
    // 添加额外信息
    html += `<p><strong>距离太阳：</strong>${data.distance} 单位</p>`;
    html += `<p><strong>半径：</strong>${data.radius} 单位</p>`;
    
    infoContent.innerHTML = html;
}

function getInfoLabel(key) {
    const labels = {
        diameter: '直径',
        mass: '质量',
        distance: '距离',
        period: '公转周期',
        temperature: '表面温度',
        type: '类型'
    };
    return labels[key] || key;
}

// 处理页面卸载
window.addEventListener('beforeunload', () => {
    if (solarSystem) {
        solarSystem.dispose();
    }
});

