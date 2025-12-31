// 太阳系核心类
class SolarSystem {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.planets = {};
        this.orbits = {};
        this.labels = {};
        this.isPaused = false;
        this.timeSpeed = 1.0;
        this.animationId = null;
        this.focusedPlanet = null; // 当前聚焦的天体
        this.focusOffset = null; // 聚焦时的相机偏移量
        this.isFocusAnimating = false; // 是否正在执行聚焦动画

        // 银河系运动参数
        this.galaxyRotation = 0;
        this.galaxyRotationSpeed = 0.002; // 银河系旋转速度
        this.solarSystemGroup = null; // 包含整个太阳系的组
        this.galaxyCenter = new THREE.Vector3(0, 0, 0); // 银河系中心
        
        // 天文数据（相对比例）
        this.planetData = {
            sun: {
                name: '太阳',
                radius: 20,
                distance: 0,
                color: 0xffd700,
                rotationSpeed: 0.01,
                orbitSpeed: 0,
                emissive: true,
                info: {
                    diameter: { value: '1,392,700', unit: 'km' },
                    mass: '1.989 × 10³⁰',
                    temperature: { value: '5,778', unit: 'K' },
                    type: 'G型主序星'
                }
            },
            mercury: {
                name: '水星',
                radius: 0.8,
                distance: 50,
                color: 0x8c7853,
                rotationSpeed: 0.02,
                orbitSpeed: 0.04,
                eccentricity: 0.206,
                inclination: 7.0,
                info: {
                    diameter: { value: '4,879', unit: 'km' },
                    mass: '3.301 × 10²³',
                    distance: { value: '57.9', unit: 'million km' },
                    period: { value: '88', unit: 'days' },
                    eccentricity: '0.206',
                    inclination: '7.0°'
                }
            },
            venus: {
                name: '金星',
                radius: 1.0,
                distance: 70,
                color: 0xffc649,
                rotationSpeed: -0.015,
                orbitSpeed: 0.03,
                eccentricity: 0.007,
                inclination: 3.4,
                info: {
                    diameter: { value: '12,104', unit: 'km' },
                    mass: '4.867 × 10²⁴',
                    distance: { value: '108.2', unit: 'million km' },
                    period: { value: '225', unit: 'days' },
                    eccentricity: '0.007',
                    inclination: '3.4°'
                }
            },
            earth: {
                name: '地球',
                radius: 1.1,
                distance: 100,
                color: 0x6b93d6,
                rotationSpeed: 0.025,
                orbitSpeed: 0.02,
                eccentricity: 0.017,
                inclination: 0.0,
                hasMoon: true,
                info: {
                    diameter: { value: '12,756', unit: 'km' },
                    mass: '5.972 × 10²⁴',
                    distance: { value: '149.6', unit: 'million km' },
                    period: { value: '365.25', unit: 'days' },
                    eccentricity: '0.017',
                    inclination: '0.0°'
                }
            },
            mars: {
                name: '火星',
                radius: 0.6,
                distance: 150,
                color: 0xc1440e,
                rotationSpeed: 0.02,
                orbitSpeed: 0.015,
                eccentricity: 0.094,
                inclination: 1.9,
                info: {
                    diameter: { value: '6,792', unit: 'km' },
                    mass: '6.39 × 10²³',
                    distance: { value: '227.9', unit: 'million km' },
                    period: { value: '687', unit: 'days' },
                    eccentricity: '0.094',
                    inclination: '1.9°'
                }
            },
            jupiter: {
                name: '木星',
                radius: 4.0,
                distance: 250,
                color: 0xd8ca9d,
                rotationSpeed: 0.03,
                orbitSpeed: 0.008,
                eccentricity: 0.049,
                inclination: 1.3,
                info: {
                    diameter: { value: '142,984', unit: 'km' },
                    mass: '1.898 × 10²⁷',
                    distance: { value: '778.5', unit: 'million km' },
                    period: { value: '12', unit: 'years' },
                    eccentricity: '0.049',
                    inclination: '1.3°'
                }
            },
            saturn: {
                name: '土星',
                radius: 3.5,
                distance: 350,
                color: 0xfad5a5,
                rotationSpeed: 0.025,
                orbitSpeed: 0.006,
                eccentricity: 0.057,
                inclination: 2.5,
                hasRings: true,
                info: {
                    diameter: { value: '120,536', unit: 'km' },
                    mass: '5.683 × 10²⁶',
                    distance: { value: '1,432', unit: 'million km' },
                    period: { value: '29', unit: 'years' },
                    eccentricity: '0.057',
                    inclination: '2.5°'
                }
            },
            uranus: {
                name: '天王星',
                radius: 2.5,
                distance: 450,
                color: 0x4fd0e7,
                rotationSpeed: -0.02,
                orbitSpeed: 0.004,
                eccentricity: 0.046,
                inclination: 0.8,
                info: {
                    diameter: { value: '51,118', unit: 'km' },
                    mass: '8.681 × 10²⁵',
                    distance: { value: '2,867', unit: 'million km' },
                    period: { value: '84', unit: 'years' },
                    eccentricity: '0.046',
                    inclination: '0.8°'
                }
            },
            neptune: {
                name: '海王星',
                radius: 2.4,
                distance: 550,
                color: 0x4b70dd,
                rotationSpeed: 0.022,
                orbitSpeed: 0.003,
                eccentricity: 0.009,
                inclination: 1.8,
                info: {
                    diameter: { value: '49,528', unit: 'km' },
                    mass: '1.024 × 10²⁶',
                    distance: { value: '4,515', unit: 'million km' },
                    period: { value: '165', unit: 'years' },
                    eccentricity: '0.009',
                    inclination: '1.8°'
                }
            }
        };
        
        this.init();
    }
    
    init() {
        // 创建场景
        this.scene = new THREE.Scene();

        // 创建相机
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        );
        this.camera.position.set(0, 200, 400);

        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // 创建轨道控制器
        window.currentOrbitControls = null;
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        window.currentOrbitControls = this.controls;
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 1;  // 允许更近距离观察
        this.controls.maxDistance = 2000;
        this.controls.rotateSpeed = 0.2;  // 降低旋转速度
        this.controls.zoomSpeed = 0.5;  // 降低缩放速度
        this.controls.panSpeed = 0.3;  // 降低平移速度

        // 创建太阳系组（包含所有太阳系元素）
        this.solarSystemGroup = new THREE.Group();
        this.scene.add(this.solarSystemGroup);

        // 添加星空背景
        this.createStarField();

        // 添加光照
        this.setupLighting();

        // 创建太阳和行星
        this.createSun();
        this.createPlanets();

        // 创建轨道线
        this.createOrbits();

        // 创建标签
        this.createLabels();

        // 创建银河系中心指示器（可选，用于视觉参考）
        this.createGalaxyCenterIndicator();

        // 处理窗口大小变化
        window.addEventListener('resize', () => this.onWindowResize());

        // 开始动画
        this.animate();
    }
    
    createStarField() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1,  // 减小星星大小
            transparent: true,
            opacity: 0.6,  // 降低不透明度
            sizeAttenuation: true
        });
        
        const starsVertices = [];
        // 减少星星数量，避免闪烁
        for (let i = 0; i < 3000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starsVertices.push(x, y, z);
        }
        
        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
    }
    
    setupLighting() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // 太阳光（点光源）
        const sunLight = new THREE.PointLight(0xffffff, 2, 2000);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);
        
        // 存储光源引用以便后续更新位置
        this.sunLight = sunLight;
    }
    
    createSun() {
        const data = this.planetData.sun;
        // 增加细分，使表面更平滑
        const geometry = new THREE.SphereGeometry(data.radius, 64, 64);
        const material = new THREE.MeshBasicMaterial({
            color: data.color,
            emissive: data.color,
            emissiveIntensity: 1
        });
        
        const sun = new THREE.Mesh(geometry, material);
        sun.userData = { name: 'sun', data: data };
        this.planets.sun = sun;
        this.solarSystemGroup.add(sun);
        
        // 添加光晕效果
        const glowGeometry = new THREE.SphereGeometry(data.radius * 1.2, 64, 64);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: data.color,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        sun.add(glow);
    }
    
    createPlanets() {
        Object.keys(this.planetData).forEach(key => {
            if (key === 'sun') return;
            
            const data = this.planetData[key];
            // 增加细分，使表面更细腻
            const geometry = new THREE.SphereGeometry(data.radius, 64, 64);
            
            // 创建更细腻的材质
            const material = new THREE.MeshStandardMaterial({
                color: data.color,
                roughness: 0.9,
                metalness: 0.1,
                flatShading: false  // 使用平滑着色
            });
            
            // 添加程序化纹理细节
            this.addPlanetTexture(material, data);
            
            const planet = new THREE.Mesh(geometry, material);
            planet.castShadow = true;
            planet.receiveShadow = true;
            planet.position.x = data.distance;
            planet.userData = {
                name: key,
                data: data,
                angle: Math.random() * Math.PI * 2,
                rotationAngle: 0
            };
            
            this.planets[key] = planet;
            this.solarSystemGroup.add(planet);
            
            // 添加土星环
            if (data.hasRings) {
                this.createRings(planet, data.radius);
            }
            
            // 添加月球（地球）
            if (data.hasMoon) {
                this.createMoon(planet);
            }
        });
    }
    
    addPlanetTexture(material, data) {
        // 创建程序化噪声纹理来增加细节
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // 创建基础颜色
        const baseColor = new THREE.Color(data.color);
        ctx.fillStyle = `rgb(${Math.floor(baseColor.r * 255)}, ${Math.floor(baseColor.g * 255)}, ${Math.floor(baseColor.b * 255)})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 添加噪声纹理
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const dataArray = imageData.data;
        
        for (let i = 0; i < dataArray.length; i += 4) {
            const noise = (Math.random() - 0.5) * 20;  // 轻微噪声
            dataArray[i] = Math.max(0, Math.min(255, dataArray[i] + noise));
            dataArray[i + 1] = Math.max(0, Math.min(255, dataArray[i + 1] + noise));
            dataArray[i + 2] = Math.max(0, Math.min(255, dataArray[i + 2] + noise));
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        
        material.map = texture;
        material.needsUpdate = true;
    }
    
    createRings(planet, planetRadius) {
        const ringGeometry = new THREE.RingGeometry(planetRadius * 1.5, planetRadius * 2.5, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xaaaaaa,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        planet.add(ring);
    }
    
    createMoon(planet) {
        const moonGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const moonMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.9
        });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moon.position.set(planet.userData.data.radius * 2, 0, 0);
        moon.castShadow = true;
        moon.userData = {
            name: 'moon',
            distance: planet.userData.data.radius * 2,
            angle: 0,
            orbitSpeed: 0.1
        };
        planet.userData.moon = moon;
        planet.add(moon);
    }
    
    createOrbits() {
        Object.keys(this.planetData).forEach(key => {
            if (key === 'sun') return;
            
            const data = this.planetData[key];
            const eccentricity = data.eccentricity || 0;
            const semiMajorAxis = data.distance;
            const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity);
            
            // 创建椭圆轨道点
            const points = [];
            const segments = 200;
            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                // 使用与行星相同的椭圆轨道公式
                const r = semiMajorAxis * (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(angle));
                const x = r * Math.cos(angle);
                const z = r * Math.sin(angle);
                let y = 0;
                
                // 应用轨道倾角（与行星位置计算一致）
                if (data.inclination) {
                    const inclination = (data.inclination * Math.PI) / 180;
                    y = z * Math.sin(inclination);
                    const zNew = z * Math.cos(inclination);
                    points.push(new THREE.Vector3(x, y, zNew));
                } else {
                    points.push(new THREE.Vector3(x, y, z));
                }
            }
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            
            const material = new THREE.LineBasicMaterial({
                color: 0x444444,
                transparent: true,
                opacity: 0.3
            });
            
            const orbit = new THREE.Line(geometry, material);
            this.orbits[key] = orbit;
            this.solarSystemGroup.add(orbit);
        });
    }
    
    createLabels() {
        const loader = new THREE.FontLoader();
        // 使用简单的文本精灵代替字体加载
        const texts = typeof i18n !== 'undefined' && i18n[currentLanguage] ? i18n[currentLanguage].planets : {};

        Object.keys(this.planetData).forEach(key => {
            const data = this.planetData[key];
            const planetName = texts[key] || data.name;

            this.createLabel(key, planetName);
        });
    }

    createLabel(key, text) {
        const data = this.planetData[key];
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;

        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = '#ffffff';
        context.font = '32px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(20, 5, 1);

        if (key === 'sun') {
            sprite.position.set(0, this.planetData.sun.radius + 10, 0);
        } else {
            sprite.position.set(data.distance, data.radius + 5, 0);
        }

            this.labels[key] = sprite;
            this.solarSystemGroup.add(sprite);
    }

    createGalaxyCenterIndicator() {
        // 创建银河系中心的视觉指示（可选）
        const centerGeometry = new THREE.SphereGeometry(2, 16, 16);
        const centerMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3
        });
        const centerIndicator = new THREE.Mesh(centerGeometry, centerMaterial);
        centerIndicator.position.copy(this.galaxyCenter);
        this.scene.add(centerIndicator);

        // 添加银河系中心的环
        const ringGeometry = new THREE.RingGeometry(3, 3.2, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x6666ff,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        ring.position.copy(this.galaxyCenter);
        this.scene.add(ring);
    }

    updateLabels(lang) {
        const texts = typeof i18n !== 'undefined' && i18n[lang] ? i18n[lang].planets : {};

        Object.keys(this.planetData).forEach(key => {
            const planetName = texts[key] || this.planetData[key].name;

            // 移除旧标签
            if (this.labels[key]) {
                this.scene.remove(this.labels[key]);
                if (this.labels[key].material) {
                    if (this.labels[key].material.map) {
                        this.labels[key].material.map.dispose();
                    }
                    this.labels[key].material.dispose();
                }
            }

            // 创建新标签
            this.createLabel(key, planetName);
        });
    }
    
    update(deltaTime) {
        if (this.isPaused) return;

        const speed = this.timeSpeed * deltaTime;

        // 更新银河系旋转（太阳系围绕银河系中心运动）
        if (!this.isFocusAnimating && !this.focusedPlanet) {
            this.galaxyRotation += this.galaxyRotationSpeed * speed;
            this.solarSystemGroup.rotation.y = this.galaxyRotation;
        }

        // 更新太阳旋转
        if (this.planets.sun) {
            this.planets.sun.rotation.y += this.planetData.sun.rotationSpeed * speed;
        }
        
        // 更新行星
        Object.keys(this.planets).forEach(key => {
            if (key === 'sun') return;
            
            const planet = this.planets[key];
            const data = this.planetData[key];
            
            // 公转（支持椭圆轨道）
            planet.userData.angle += data.orbitSpeed * speed;
            const eccentricity = data.eccentricity || 0;
            const semiMajorAxis = data.distance;
            
            // 计算椭圆轨道位置（使用与轨道线相同的公式）
            const trueAnomaly = planet.userData.angle;
            const r = semiMajorAxis * (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(trueAnomaly));
            
            // 先计算在轨道平面上的位置
            let x = r * Math.cos(trueAnomaly);
            let z = r * Math.sin(trueAnomaly);
            let y = 0;
            
            // 应用轨道倾角（绕x轴旋转）
            if (data.inclination) {
                const inclination = (data.inclination * Math.PI) / 180;
                y = z * Math.sin(inclination);
                z = z * Math.cos(inclination);
            }
            
            planet.position.set(x, y, z);
            
            // 自转
            planet.userData.rotationAngle += data.rotationSpeed * speed;
            planet.rotation.y = planet.userData.rotationAngle;
            
            // 更新标签位置
            if (this.labels[key]) {
                this.labels[key].position.copy(planet.position);
                this.labels[key].position.y += data.radius + 5;
                // Sprite会自动面向相机，无需手动设置
            }
            
            // 更新月球
            if (planet.userData.moon) {
                const moon = planet.userData.moon;
                moon.userData.angle += moon.userData.orbitSpeed * speed;
                moon.position.x = Math.cos(moon.userData.angle) * moon.userData.distance;
                moon.position.z = Math.sin(moon.userData.angle) * moon.userData.distance;
            }
        });
        
        // 更新太阳光位置
        if (this.sunLight && this.planets.sun) {
            this.sunLight.position.copy(this.planets.sun.position);
        }
        
        // 如果正在聚焦某个天体，更新相机位置跟随天体移动
        if (this.focusedPlanet && this.planets[this.focusedPlanet] && this.focusOffset) {
            // 动画中：由动画函数控制相机位置，不在这里更新
            if (this.isFocusAnimating) {
                // 动画中，不更新，让动画函数完全控制
                // 也不调用controls.update()，避免冲突
                return;
            }
            
            // 动画完成后：每帧跟随天体移动
            const focusedPlanet = this.planets[this.focusedPlanet];

            // 获取天体的世界坐标（考虑太阳系组的旋转）
            const worldPosition = new THREE.Vector3();
            focusedPlanet.getWorldPosition(worldPosition);

            // 更新控制器目标为天体的世界坐标
            this.controls.target.copy(worldPosition);

            // 更新相机位置，保持相对偏移（跟随天体移动）
            const newCameraPosition = new THREE.Vector3().addVectors(worldPosition, this.focusOffset);
            this.camera.position.copy(newCameraPosition);
            
            // 更新控制器的内部状态，使其与当前相机位置同步
            // 这样控制器就不会覆盖我们的设置
            const offset = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
            if (this.controls.spherical) {
                this.controls.spherical.setFromVector3(offset);
                // 重置所有增量，防止累积
                this.controls.spherical.theta = this.controls.spherical.theta;
                this.controls.spherical.phi = this.controls.spherical.phi;
                this.controls.spherical.radius = this.controls.spherical.radius;
            }
            if (this.controls.sphericalDelta) {
                this.controls.sphericalDelta.set(0, 0, 0);
            }
            if (this.controls.panOffset) {
                this.controls.panOffset.set(0, 0, 0);
            }
            if (this.controls.scale !== undefined) {
                this.controls.scale = 1;
            }
            
            // 确保相机朝向目标
            this.camera.lookAt(this.controls.target);
            
            // 强制更新相机矩阵，确保位置生效
            this.camera.updateMatrixWorld(true);
            
            // 不调用controls.update()，避免覆盖我们的设置
            // 直接返回，不执行后面的controls.update()
            return;
        }
        
        // 非聚焦状态：正常更新控制器
        this.controls.update();
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        const deltaTime = 0.016; // 约60fps
        this.update(deltaTime);
        
        this.renderer.render(this.scene, this.camera);
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    setTimeSpeed(speed) {
        this.timeSpeed = speed;
    }
    
    pause() {
        this.isPaused = !this.isPaused;
    }
    
    reset() {
        Object.keys(this.planets).forEach(key => {
            if (key === 'sun') {
                this.planets[key].rotation.y = 0;
            } else {
                const planet = this.planets[key];
                planet.userData.angle = Math.random() * Math.PI * 2;
                planet.userData.rotationAngle = 0;
                if (planet.userData.moon) {
                    planet.userData.moon.userData.angle = 0;
                }
            }
        });
    }
    
    resetCamera() {
        // 取消聚焦
        this.unfocusPlanet();
        
        // 恢复到初始相机位置
        const initialPosition = new THREE.Vector3(0, 200, 400);
        const initialTarget = new THREE.Vector3(0, 0, 0);
        
        // 使用动画平滑过渡
        const startPosition = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        const duration = 1500; // 1.5秒
        const startTime = Date.now();
        const self = this;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // 缓动函数
            
            // 插值相机位置和目标
            const currentPos = new THREE.Vector3().lerpVectors(startPosition, initialPosition, easeProgress);
            const currentTarget = new THREE.Vector3().lerpVectors(startTarget, initialTarget, easeProgress);
            
            self.camera.position.copy(currentPos);
            self.controls.target.copy(currentTarget);
            
            // 更新控制器的内部状态
            const offset = new THREE.Vector3().subVectors(self.camera.position, self.controls.target);
            if (self.controls.spherical) {
                self.controls.spherical.setFromVector3(offset);
            }
            if (self.controls.sphericalDelta) {
                self.controls.sphericalDelta.set(0, 0, 0);
            }
            if (self.controls.panOffset) {
                self.controls.panOffset.set(0, 0, 0);
            }
            if (self.controls.scale !== undefined) {
                self.controls.scale = 1;
            }
            
            self.camera.lookAt(self.controls.target);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // 动画完成后，确保位置准确
                self.camera.position.copy(initialPosition);
                self.controls.target.copy(initialTarget);
                if (self.controls.spherical) {
                    const finalOffset = new THREE.Vector3().subVectors(self.camera.position, self.controls.target);
                    self.controls.spherical.setFromVector3(finalOffset);
                }
            }
        };
        
        animate();
    }
    
    focusPlanet(planetName) {
        if (!this.planets[planetName]) return;
        
        const planet = this.planets[planetName];
        const data = this.planetData[planetName];
        
        // 根据天体大小计算合适的观察距离（更接近）
        const planetRadius = data.radius;
        // 相机距离设为天体半径的5-8倍，确保能看到完整的天体
        const cameraDistance = Math.max(planetRadius * 6, 5);
        
        // 计算相机相对天体的偏移量（从侧面观察）
        const offset = new THREE.Vector3(
            cameraDistance * 0.7,
            cameraDistance * 0.3,
            cameraDistance * 0.7
        );
        
        // 立即设置聚焦状态
        this.focusedPlanet = planetName;
        this.focusOffset = offset.clone();
        this.isFocusAnimating = true; // 标记正在动画
        
        // 使用动画过渡
        const startPosition = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        const duration = 1500; // 1.5秒，更快一点
        const startTime = Date.now();
        const self = this;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // 缓动函数
            
            // 在动画过程中，实时获取天体的当前位置（因为天体在移动）
            const currentPlanet = self.planets[planetName];
            if (!currentPlanet) {
                self.unfocusPlanet();
                return;
            }
            
            // 计算当前目标位置（跟随天体移动）
            const currentTargetPos = currentPlanet.position.clone();
            const currentCameraTargetPos = new THREE.Vector3().addVectors(currentPlanet.position, offset);
            
            // 使用向量插值
            const currentPos = new THREE.Vector3().lerpVectors(startPosition, currentCameraTargetPos, easeProgress);
            const currentTarget = new THREE.Vector3().lerpVectors(startTarget, currentTargetPos, easeProgress);
            
            self.camera.position.copy(currentPos);
            self.controls.target.copy(currentTarget);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // 动画完成后，确保目标位置准确，并允许update方法接管跟随
                // 确保相机位置正确（使用当前天体位置）
                const finalCameraPos = new THREE.Vector3().addVectors(currentPlanet.position, offset);
                self.camera.position.copy(finalCameraPos);
                self.controls.target.copy(currentPlanet.position);
                self.camera.lookAt(self.controls.target);
                
                // 同步更新控制器的内部状态
                const finalOffset = new THREE.Vector3().subVectors(self.camera.position, self.controls.target);
                if (self.controls.spherical) {
                    self.controls.spherical.setFromVector3(finalOffset);
                }
                if (self.controls.sphericalDelta) {
                    self.controls.sphericalDelta.set(0, 0, 0);
                }
                if (self.controls.panOffset) {
                    self.controls.panOffset.set(0, 0, 0);
                }
                if (self.controls.scale !== undefined) {
                    self.controls.scale = 1;
                }
                
                // 强制更新相机矩阵
                self.camera.updateMatrixWorld(true);
                
                // 动画完成，允许跟随（必须在最后设置）
                self.isFocusAnimating = false;

                // 立即执行一次跟随更新，确保位置正确
                // 使用setTimeout确保在下一帧执行
                setTimeout(() => {
                    if (self.focusedPlanet && self.planets[self.focusedPlanet] && self.focusOffset) {
                        const planet = self.planets[self.focusedPlanet];
                        self.controls.target.copy(planet.position);
                        const camPos = new THREE.Vector3().addVectors(planet.position, self.focusOffset);
                        self.camera.position.copy(camPos);
                        self.camera.lookAt(self.controls.target);
                    }
                }, 0);
            }
        };
        
        animate();
    }
    
    // 取消聚焦
    unfocusPlanet() {
        this.focusedPlanet = null;
        this.focusOffset = null;
        this.isFocusAnimating = false;
        
        // 恢复控制器的正常更新
        if (this.controls.update && this.controls._originalUpdate) {
            this.controls.update = this.controls._originalUpdate;
        }
    }
    
    toggleOrbits(show) {
        Object.values(this.orbits).forEach(orbit => {
            orbit.visible = show;
        });
    }
    
    toggleLabels(show) {
        Object.values(this.labels).forEach(label => {
            label.visible = show;
        });
    }
    
    getPlanetInfo(planetName) {
        if (!this.planetData[planetName]) return null;
        return this.planetData[planetName].info;
    }
    
    getPlanetByName(planetName) {
        return this.planets[planetName];
    }
    
    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // 清理资源
        this.scene.traverse(object => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(m => m.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        
        this.renderer.dispose();
    }
}

